import fs from 'fs';
import path from 'path';
import {
  Banner,
  Booking,
  DashboardStats,
  District,
  Service,
  ServiceCategory,
  SiteSettings,
  Subcategory,
  Testimonial,
  WhyChooseUsItem,
  WhyChooseUsSection,
} from '@/types';
import { getAdminClient } from './supabase/admin';

function getClientOrThrow() {
  const client = getAdminClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local.'
    );
  }
  return client;
}

// -----------------------------------------------------------------------------
// SITE SETTINGS
// -----------------------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const client = getClientOrThrow();
  const { data, error } = await client
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    console.error('Database error in getSiteSettings:', error.message);
    throw new Error(`Failed to load site settings from Supabase: ${error.message}`);
  }

  return data as SiteSettings | null;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const client = getClientOrThrow();
  const { data, error } = await client
    .from('site_settings')
    .upsert({ ...settings, id: 'default', updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.error('Database error in updateSiteSettings:', error.message);
    throw new Error(`Failed to update site settings in Supabase: ${error.message}`);
  }

  return data as SiteSettings;
}

// -----------------------------------------------------------------------------
// BANNERS
// -----------------------------------------------------------------------------
const BANNERS_META_FILE = path.join(process.cwd(), 'data', 'banners_metadata.json');

function readBannerMetadata(): Record<string, { mobile_image_url?: string }> {
  try {
    if (fs.existsSync(BANNERS_META_FILE)) {
      const content = fs.readFileSync(BANNERS_META_FILE, 'utf-8');
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error('Error reading banner metadata:', err);
  }
  return {};
}

function writeBannerMetadata(meta: Record<string, { mobile_image_url?: string }>): void {
  try {
    const dir = path.dirname(BANNERS_META_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BANNERS_META_FILE, JSON.stringify(meta, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing banner metadata:', err);
  }
}

export async function getBanners(onlyActive = true): Promise<Banner[]> {
  const client = getClientOrThrow();
  let query = client.from('banners').select('*').order('display_order', { ascending: true });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Database error in getBanners:', error.message);
    throw new Error(`Failed to load banners from Supabase: ${error.message}`);
  }

  const meta = readBannerMetadata();
  return ((data as Banner[]) || []).map((b) => ({
    ...b,
    mobile_image_url: b.mobile_image_url || meta[b.id]?.mobile_image_url || undefined,
  }));
}

export async function saveBanner(banner: Partial<Banner> & { heading: string; background_image: string }): Promise<Banner> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();
  const mobileImageUrl = banner.mobile_image_url;

  let savedData: Banner | null = null;

  try {
    if (banner.id) {
      const { data, error } = await client
        .from('banners')
        .update({ ...banner, updated_at: now })
        .eq('id', banner.id)
        .select()
        .single();

      if (!error && data) {
        savedData = data as Banner;
      } else if (error && (error.code === 'PGRST204' || error.message.includes('mobile_image_url'))) {
        const { mobile_image_url, ...withoutMobile } = banner;
        const fallbackRes = await client
          .from('banners')
          .update({ ...withoutMobile, updated_at: now })
          .eq('id', banner.id)
          .select()
          .single();
        if (fallbackRes.error) throw new Error(fallbackRes.error.message);
        savedData = fallbackRes.data as Banner;
      } else if (error) {
        throw new Error(error.message);
      }
    } else {
      const { data, error } = await client
        .from('banners')
        .insert({ ...banner, created_at: now, updated_at: now })
        .select()
        .single();

      if (!error && data) {
        savedData = data as Banner;
      } else if (error && (error.code === 'PGRST204' || error.message.includes('mobile_image_url'))) {
        const { mobile_image_url, ...withoutMobile } = banner;
        const fallbackRes = await client
          .from('banners')
          .insert({ ...withoutMobile, created_at: now, updated_at: now })
          .select()
          .single();
        if (fallbackRes.error) throw new Error(fallbackRes.error.message);
        savedData = fallbackRes.data as Banner;
      } else if (error) {
        throw new Error(error.message);
      }
    }
  } catch (err: unknown) {
    console.error('Supabase error saving banner:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to save banner');
  }

  if (savedData) {
    const meta = readBannerMetadata();
    meta[savedData.id] = { mobile_image_url: mobileImageUrl || '' };
    writeBannerMetadata(meta);
    return { ...savedData, mobile_image_url: mobileImageUrl || undefined };
  }

  throw new Error('Failed to save banner');
}

export async function deleteBanner(id: string): Promise<boolean> {
  const client = getClientOrThrow();
  const { error } = await client.from('banners').delete().eq('id', id);
  if (error) throw new Error(`Supabase error deleting banner: ${error.message}`);
  const meta = readBannerMetadata();
  delete meta[id];
  writeBannerMetadata(meta);
  return true;
}

// -----------------------------------------------------------------------------
// SERVICE CATEGORIES
// -----------------------------------------------------------------------------
const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

export function readLocalCategories(): ServiceCategory[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local categories:', err);
  }
  return [];
}

export function writeLocalCategories(categories: ServiceCategory[]): void {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local categories:', err);
  }
}

export async function getServiceCategories(onlyActive = true): Promise<ServiceCategory[]> {
  try {
    const client = getAdminClient();
    if (client) {
      let query = client
        .from('service_categories')
        .select('*, services:services(count), subcategories:subcategories(count)')
        .order('display_order', { ascending: true });

      if (onlyActive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((cat: any) => ({
          ...cat,
          services_count: cat.services?.[0]?.count ?? 0,
        }));
        writeLocalCategories(formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Supabase getServiceCategories error, using local fallback:', err);
  }

  const localList = readLocalCategories();
  return onlyActive ? localList.filter((c) => c.is_active) : localList;
}

export async function getServiceCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  try {
    const client = getAdminClient();
    if (client) {
      const { data, error } = await client
        .from('service_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return data as ServiceCategory;
      }
    }
  } catch {}

  const localList = readLocalCategories();
  return localList.find((c) => c.slug === slug) || null;
}

export async function saveServiceCategory(
  category: Partial<ServiceCategory> & { name: string; slug: string }
): Promise<ServiceCategory> {
  const now = new Date().toISOString();
  let savedCategory: ServiceCategory | null = null;

  try {
    const client = getAdminClient();
    if (client) {
      if (category.id) {
        const { data, error } = await client
          .from('service_categories')
          .update({
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            display_order: category.display_order ?? 1,
            is_active: category.is_active ?? true,
            updated_at: now,
          })
          .eq('id', category.id)
          .select()
          .single();

        if (!error && data) savedCategory = data as ServiceCategory;
      } else {
        const { data, error } = await client
          .from('service_categories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            display_order: category.display_order ?? 1,
            is_active: category.is_active ?? true,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (!error && data) savedCategory = data as ServiceCategory;
      }
    }
  } catch (err) {
    console.warn('Supabase saveServiceCategory error, saving locally:', err);
  }

  const localList = readLocalCategories();
  const targetId = savedCategory?.id || category.id || `cat-${category.slug}`;
  const existingIdx = localList.findIndex((c) => c.id === targetId || c.slug === category.slug);
  const finalCategory: ServiceCategory = {
    id: targetId,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image_url: category.image_url,
    display_order: Number(category.display_order) || (existingIdx >= 0 ? localList[existingIdx].display_order : localList.length + 1),
    is_active: category.is_active ?? true,
    created_at: existingIdx >= 0 ? localList[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...finalCategory };
  } else {
    localList.push(finalCategory);
  }
  writeLocalCategories(localList);

  return savedCategory || finalCategory;
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
  try {
    const client = getAdminClient();
    if (client) {
      await client.from('service_categories').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteServiceCategory error:', err);
  }

  const localList = readLocalCategories();
  writeLocalCategories(localList.filter((c) => c.id !== id && c.slug !== id));
  return true;
}

// -----------------------------------------------------------------------------
// SUBCATEGORIES
// -----------------------------------------------------------------------------
export async function getSubcategories(options?: {
  onlyActive?: boolean;
  categoryId?: string;
  categorySlug?: string;
}): Promise<Subcategory[]> {
  const client = getClientOrThrow();
  const onlyActive = options?.onlyActive ?? true;

  let query = client
    .from('subcategories')
    .select('*, category:service_categories(*), services:services(id, name, slug, is_active)')
    .order('display_order', { ascending: true });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Database error in getSubcategories:', error.message);
    throw new Error(`Failed to load subcategories: ${error.message}`);
  }

  // Get available districts/locations (with fallback)
  const defaultDistricts = await getDistricts(onlyActive).catch(() => DEFAULT_LOCATIONS);

  let subcategories = ((data || []) as any[]).map((sub) => {
    return {
      ...sub,
      category_name: sub.category?.name,
      category_slug: sub.category?.slug,
      services_count: sub.services?.length ?? 0,
      districts: defaultDistricts,
    } as Subcategory;
  });

  if (options?.categorySlug) {
    subcategories = subcategories.filter((s) => s.category_slug === options.categorySlug);
  }

  return subcategories;
}

export async function getSubcategoryBySlug(slug: string): Promise<Subcategory | null> {
  const client = getClientOrThrow();
  const { data, error } = await client
    .from('subcategories')
    .select('*, category:service_categories(*)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Database error in getSubcategoryBySlug:', error.message);
    throw new Error(`Failed to load subcategory "${slug}": ${error.message}`);
  }

  return data as Subcategory | null;
}

export async function saveSubcategory(
  sub: Partial<Subcategory> & { category_id: string; name: string; slug: string }
): Promise<Subcategory> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();

  if (sub.id) {
    const { data, error } = await client
      .from('subcategories')
      .update({
        category_id: sub.category_id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description || '',
        image_url: sub.image_url || '',
        icon: sub.icon || 'Wrench',
        display_order: sub.display_order ?? 1,
        is_active: sub.is_active ?? true,
        updated_at: now,
      })
      .eq('id', sub.id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error saving subcategory: ${error.message}`);
    return data as Subcategory;
  }

  const { data, error } = await client
    .from('subcategories')
    .insert({
      category_id: sub.category_id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description || '',
      image_url: sub.image_url || '',
      icon: sub.icon || 'Wrench',
      display_order: sub.display_order ?? 1,
      is_active: sub.is_active ?? true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(`Supabase error creating subcategory: ${error.message}`);
  return data as Subcategory;
}

export async function deleteSubcategory(id: string): Promise<boolean> {
  const client = getClientOrThrow();

  // Guard: check if any services are assigned to this subcategory
  const { count, error: countErr } = await client
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('subcategory_id', id);

  if (countErr) {
    throw new Error(`Failed to check subcategory services: ${countErr.message}`);
  }

  if (count && count > 0) {
    throw new Error(
      `Cannot delete subcategory: it is currently assigned to ${count} service(s). Please reassign or delete those services first.`
    );
  }

  const { error } = await client.from('subcategories').delete().eq('id', id);
  if (error) throw new Error(`Supabase error deleting subcategory: ${error.message}`);
  return true;
}

// -----------------------------------------------------------------------------
// NAVIGATION HIERARCHY HELPER (CATEGORIES -> SERVICES -> LOCATIONS)
// -----------------------------------------------------------------------------
export async function getNavigationHierarchy(): Promise<ServiceCategory[]> {
  const [categories, services, districts] = await Promise.all([
    getServiceCategories(true).catch(() => readLocalCategories()),
    getServices(true).catch(() => readLocalServices()),
    getDistricts(true).catch(() => DEFAULT_LOCATIONS),
  ]);

  return categories.map((cat) => ({
    ...cat,
    services: services
      .filter(
        (s) =>
          s.category_id === cat.id ||
          (s.category_slug && cat.slug && s.category_slug === cat.slug) ||
          (s.category?.slug && cat.slug && s.category.slug === cat.slug)
      )
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
      .map((s) => ({
        ...s,
        districts: s.districts && s.districts.length > 0 ? s.districts : districts,
      })),
  }));
}

// -----------------------------------------------------------------------------
// DISTRICTS / LOCATIONS WITH PERSISTENT FALLBACK
// -----------------------------------------------------------------------------
export const DEFAULT_LOCATIONS: District[] = [
  { id: 'loc-calicut', name: 'Calicut', slug: 'calicut', is_active: true, display_order: 1 },
  { id: 'loc-trivandrum', name: 'Trivandrum', slug: 'trivandrum', is_active: true, display_order: 2 },
  { id: 'loc-kochi', name: 'Kochi', slug: 'kochi', is_active: true, display_order: 3 },
  { id: 'loc-malappuram', name: 'Malappuram', slug: 'malappuram', is_active: true, display_order: 4 },
  { id: 'loc-thrissur', name: 'Thrissur', slug: 'thrissur', is_active: true, display_order: 5 },
  { id: 'loc-kannur', name: 'Kannur', slug: 'kannur', is_active: true, display_order: 6 },
];

const DISTRICTS_FILE = path.join(process.cwd(), 'data', 'districts.json');
const SERVICE_DISTRICTS_FILE = path.join(process.cwd(), 'data', 'service_districts.json');

function readLocalDistricts(): District[] {
  try {
    if (fs.existsSync(DISTRICTS_FILE)) {
      const content = fs.readFileSync(DISTRICTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local districts:', err);
  }
  return DEFAULT_LOCATIONS;
}

function writeLocalDistricts(districts: District[]): void {
  try {
    const dir = path.dirname(DISTRICTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DISTRICTS_FILE, JSON.stringify(districts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local districts:', err);
  }
}

function readLocalServiceDistricts(): Record<string, string[]> {
  try {
    if (fs.existsSync(SERVICE_DISTRICTS_FILE)) {
      const content = fs.readFileSync(SERVICE_DISTRICTS_FILE, 'utf-8');
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error('Error reading service districts file:', err);
  }
  return {};
}

function writeLocalServiceDistricts(data: Record<string, string[]>): void {
  try {
    const dir = path.dirname(SERVICE_DISTRICTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SERVICE_DISTRICTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing service districts file:', err);
  }
}

export async function getDistricts(onlyActive = true): Promise<District[]> {
  const client = getClientOrThrow();
  try {
    let query = client.from('districts').select('*').order('display_order', { ascending: true });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as District[];
    }
  } catch {
    // Supabase table not available; fall back to local file
  }

  const local = readLocalDistricts();
  return onlyActive ? local.filter((d) => d.is_active) : local;
}

export async function getDistrictBySlug(slug: string): Promise<District | null> {
  const client = getClientOrThrow();
  try {
    const { data, error } = await client
      .from('districts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return data as District;
    }
  } catch {}

  const local = readLocalDistricts();
  return local.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function saveDistrict(district: Partial<District> & { name: string; slug: string }): Promise<District> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();

  let savedFromDb: District | null = null;

  try {
    if (district.id && !district.id.startsWith('loc-')) {
      const { data, error } = await client
        .from('districts')
        .update({
          name: district.name,
          slug: district.slug,
          display_order: district.display_order ?? 1,
          is_active: district.is_active ?? true,
          updated_at: now,
        })
        .eq('id', district.id)
        .select()
        .single();

      if (!error && data) {
        savedFromDb = data as District;
      }
    } else {
      const { data, error } = await client
        .from('districts')
        .insert({
          name: district.name,
          slug: district.slug,
          display_order: district.display_order ?? 1,
          is_active: district.is_active ?? true,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (!error && data) {
        savedFromDb = data as District;
      }
    }
  } catch {
    // If Supabase table doesn't exist, proceed to local persistent save
  }

  // Update local storage so data is preserved even before migration
  const list = readLocalDistricts();
  const targetId = savedFromDb?.id || district.id || `loc-${district.slug}`;
  const existingIdx = list.findIndex((d) => d.id === targetId || d.slug === district.slug);

  const finalDistrict: District = {
    id: targetId,
    name: district.name,
    slug: district.slug,
    display_order: district.display_order ?? (existingIdx >= 0 ? list[existingIdx].display_order : list.length + 1),
    is_active: district.is_active ?? true,
    created_at: existingIdx >= 0 ? list[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    list[existingIdx] = finalDistrict;
  } else {
    list.push(finalDistrict);
  }
  writeLocalDistricts(list);

  return savedFromDb || finalDistrict;
}

export async function deleteDistrict(id: string): Promise<boolean> {
  const client = getClientOrThrow();

  // Guard: check if any services are assigned to this district (only if junction table exists)
  try {
    const { count, error: countErr } = await client
      .from('service_districts')
      .select('id', { count: 'exact', head: true })
      .eq('district_id', id);

    if (!countErr && count && count > 0) {
      throw new Error(
        `Cannot delete district: it is currently assigned to ${count} service(s). Please remove or reassign those services before deleting this district.`
      );
    }
  } catch (err: any) {
    if (err.message?.includes('assigned to')) throw err;
  }

  // Remove from local persistent file
  const list = readLocalDistricts();
  const filtered = list.filter((d) => d.id !== id && d.slug !== id);
  writeLocalDistricts(filtered);

  // Also remove from any service district mappings
  const servMap = readLocalServiceDistricts();
  let changed = false;
  for (const sId of Object.keys(servMap)) {
    if (servMap[sId]?.includes(id)) {
      servMap[sId] = servMap[sId].filter((d) => d !== id);
      changed = true;
    }
  }
  if (changed) writeLocalServiceDistricts(servMap);

  // Try Supabase delete (safely ignore if table does not exist)
  try {
    const { error } = await client.from('districts').delete().eq('id', id);
    if (error && !error.message?.includes('Could not find the table') && error.code !== 'PGRST205') {
      console.warn('Supabase delete district notice:', error.message);
    }
  } catch (err: any) {
    if (!err.message?.includes('Could not find the table') && !err.message?.includes('PGRST205')) {
      console.warn('Supabase delete district notice:', err.message);
    }
  }

  return true;
}

// -----------------------------------------------------------------------------
// SERVICES (WITH CATEGORY, SUBCATEGORY & LOCATIONS)
// -----------------------------------------------------------------------------
const SERVICES_FILE = path.join(process.cwd(), 'data', 'services.json');

export function readLocalServices(): Service[] {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const content = fs.readFileSync(SERVICES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local services:', err);
  }
  return [];
}

export function writeLocalServices(services: Service[]): void {
  try {
    const dir = path.dirname(SERVICES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local services:', err);
  }
}

export interface ServiceQueryOptions {
  onlyActive?: boolean;
  categoryId?: string;
  categorySlug?: string;
  subcategoryId?: string;
  subcategorySlug?: string;
  districtId?: string;
  districtSlug?: string;
}

export async function getServices(options: ServiceQueryOptions | boolean = true): Promise<Service[]> {
  const opts: ServiceQueryOptions =
    typeof options === 'boolean' ? { onlyActive: options } : options;

  try {
    const client = getAdminClient();
    if (client) {
      let query = client
        .from('services')
        .select('*, category:service_categories(*)')
        .order('display_order', { ascending: true });

      if (opts.onlyActive !== false) {
        query = query.eq('is_active', true);
      }

      if (opts.categoryId) {
        query = query.eq('category_id', opts.categoryId);
      }

      if (opts.subcategoryId) {
        query = query.eq('subcategory_id', opts.subcategoryId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const defaultDistricts = await getDistricts(opts.onlyActive !== false).catch(() => DEFAULT_LOCATIONS);
        const localServiceDistrictsMap = readLocalServiceDistricts();

        let services = data.map((s: any) => {
          const assignedIds = localServiceDistrictsMap[s.id];
          let serviceDistricts = defaultDistricts;
          let serviceDistrictIds = defaultDistricts.map((d) => d.id);

          if (Array.isArray(assignedIds) && assignedIds.length > 0) {
            serviceDistrictIds = assignedIds;
            const matched = defaultDistricts.filter((d) => assignedIds.includes(d.id));
            if (matched.length > 0) {
              serviceDistricts = matched;
            }
          }

          return {
            ...s,
            category_name: s.category?.name || s.category_name,
            category_slug: s.category?.slug || s.category_slug,
            districts: serviceDistricts,
            district_ids: serviceDistrictIds,
          } as Service;
        });

        if (opts.categorySlug) {
          services = services.filter((s) => s.category_slug === opts.categorySlug);
        }

        if (opts.subcategorySlug) {
          services = services.filter((s) => s.subcategory_slug === opts.subcategorySlug);
        }

        if (opts.districtId) {
          services = services.filter((s) => s.district_ids?.includes(opts.districtId!));
        } else if (opts.districtSlug) {
          services = services.filter((s) => s.districts?.some((d) => d.slug === opts.districtSlug));
        }

        // Cache all active services locally
        if (!opts.categoryId && !opts.subcategoryId && !opts.categorySlug && !opts.subcategorySlug && !opts.districtId && !opts.districtSlug) {
          writeLocalServices(services);
        }

        return services;
      }
    }
  } catch (err) {
    console.warn('Supabase getServices error, using local fallback:', err);
  }

  // Fallback to local services
  let localServices = readLocalServices();
  if (opts.onlyActive !== false) {
    localServices = localServices.filter((s) => s.is_active);
  }
  if (opts.categoryId) {
    localServices = localServices.filter((s) => s.category_id === opts.categoryId);
  }
  if (opts.categorySlug) {
    localServices = localServices.filter((s) => s.category_slug === opts.categorySlug);
  }
  if (opts.subcategoryId) {
    localServices = localServices.filter((s) => s.subcategory_id === opts.subcategoryId);
  }
  if (opts.districtId) {
    localServices = localServices.filter((s) => s.district_ids?.includes(opts.districtId!));
  } else if (opts.districtSlug) {
    localServices = localServices.filter((s) => s.districts?.some((d) => d.slug === opts.districtSlug));
  }

  return localServices.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
}

export async function getServiceBySlug(slug: string, categorySlug?: string): Promise<Service | null> {
  try {
    const client = getAdminClient();
    if (client) {
      const { data, error } = await client
        .from('services')
        .select('*, category:service_categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        const defaultDistricts = await getDistricts(true).catch(() => DEFAULT_LOCATIONS);
        const localServiceDistrictsMap = readLocalServiceDistricts();
        const s = data as any;
        const assignedIds = localServiceDistrictsMap[s.id];
        let serviceDistricts = defaultDistricts;
        let serviceDistrictIds = defaultDistricts.map((d) => d.id);

        if (Array.isArray(assignedIds) && assignedIds.length > 0) {
          serviceDistrictIds = assignedIds;
          const matched = defaultDistricts.filter((d) => assignedIds.includes(d.id));
          if (matched.length > 0) {
            serviceDistricts = matched;
          }
        }

        const service: Service = {
          ...s,
          category_name: s.category?.name || s.category_name,
          category_slug: s.category?.slug || s.category_slug,
          districts: serviceDistricts,
          district_ids: serviceDistrictIds,
        };

        if (categorySlug && service.category_slug && service.category_slug !== categorySlug) {
          return null;
        }

        return service;
      }
    }
  } catch {}

  const localServices = readLocalServices();
  const matched = localServices.find((s) => s.slug === slug);
  if (!matched) return null;
  if (categorySlug && matched.category_slug && matched.category_slug !== categorySlug) {
    return null;
  }
  return matched;
}

export async function saveService(
  service: Partial<Service> & { name: string; slug: string; short_description: string; main_image: string },
  districtIds?: string[]
): Promise<Service> {
  const now = new Date().toISOString();
  let savedService: Service | null = null;

  // Clean category_id and subcategory_id so empty strings don't cause Postgres UUID syntax error
  const categoryId =
    service.category_id && service.category_id.trim() !== '' ? service.category_id.trim() : null;
  const subcategoryId =
    service.subcategory_id && service.subcategory_id.trim() !== '' ? service.subcategory_id.trim() : null;

  const servicePayload = {
    name: service.name,
    slug: service.slug,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    icon: service.icon || 'Wrench',
    short_description: service.short_description,
    full_description: service.full_description || null,
    main_image: service.main_image,
    additional_images: Array.isArray(service.additional_images) ? service.additional_images : [],
    benefits: Array.isArray(service.benefits) ? service.benefits : [],
    display_order: Number(service.display_order) || 1,
    is_active: typeof service.is_active === 'boolean' ? service.is_active : true,
    updated_at: now,
  };

  try {
    const client = getAdminClient();
    if (client) {
      if (service.id) {
        const { data, error } = await client
          .from('services')
          .update(servicePayload)
          .eq('id', service.id)
          .select()
          .single();

        if (!error && data) savedService = data as Service;
      } else {
        const { data, error } = await client
          .from('services')
          .insert({ ...servicePayload, created_at: now })
          .select()
          .single();

        if (!error && data) savedService = data as Service;
      }
    }
  } catch (err: any) {
    console.warn('Supabase error saving service, saving to local fallback:', err?.message);
  }

  // Update district assignments
  const targetDistricts = Array.isArray(districtIds)
    ? districtIds
    : Array.isArray(service.district_ids)
    ? service.district_ids
    : undefined;

  const targetId = savedService?.id || service.id || `srv-${service.slug}`;

  if (Array.isArray(targetDistricts)) {
    const servMap = readLocalServiceDistricts();
    servMap[targetId] = targetDistricts;
    writeLocalServiceDistricts(servMap);

    try {
      const client = getAdminClient();
      if (client) {
        await client.from('service_districts').delete().eq('service_id', targetId);
        const validUuids = targetDistricts.filter((did) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(did)
        );
        if (validUuids.length > 0) {
          const rows = validUuids.map((did) => ({
            service_id: targetId,
            district_id: did,
          }));
          await client.from('service_districts').insert(rows);
        }
      }
    } catch {}
  }

  // Update local services persistent storage
  const localList = readLocalServices();
  const existingIdx = localList.findIndex((s) => s.id === targetId || s.slug === service.slug);

  // Look up category info if available
  const localCats = readLocalCategories();
  const matchedCat = localCats.find((c) => c.id === categoryId || c.slug === service.category_slug);

  const finalService: Service = {
    ...servicePayload,
    id: targetId,
    category_id: categoryId || matchedCat?.id || undefined,
    category_name: matchedCat?.name || service.category_name,
    category_slug: matchedCat?.slug || service.category_slug || (categoryId ? 'repair-services' : undefined),
    subcategory_id: subcategoryId || undefined,
    district_ids: targetDistricts,
    created_at: existingIdx >= 0 ? localList[existingIdx].created_at : now,
    updated_at: now,
  } as Service;

  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...finalService };
  } else {
    localList.push(finalService);
  }
  writeLocalServices(localList);

  return savedService || finalService;
}

export async function deleteService(id: string): Promise<boolean> {
  try {
    const client = getAdminClient();
    if (client) {
      try {
        await client.from('service_districts').delete().eq('service_id', id);
      } catch {}
      await client.from('services').delete().eq('id', id);
    }
  } catch (err: any) {
    console.warn('Supabase delete service notice:', err?.message);
  }

  // Remove from local service_districts mapping
  const servMap = readLocalServiceDistricts();
  if (servMap[id]) {
    delete servMap[id];
    writeLocalServiceDistricts(servMap);
  }

  // Remove from local services file
  const localList = readLocalServices();
  writeLocalServices(localList.filter((s) => s.id !== id && s.slug !== id));

  return true;
}

// -----------------------------------------------------------------------------
// BOOKINGS
// -----------------------------------------------------------------------------
export interface BookingFilterOptions {
  status?: string;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  districtId?: string;
  serviceId?: string;
}

export async function getBookings(filters?: BookingFilterOptions | string, searchLegacy?: string): Promise<Booking[]> {
  const client = getClientOrThrow();
  let query = client.from('bookings').select('*').order('created_at', { ascending: false });

  let statusFilter: string | undefined;
  let search: string | undefined;
  let categoryId: string | undefined;
  let subcategoryId: string | undefined;
  let districtId: string | undefined;
  let serviceId: string | undefined;

  if (typeof filters === 'string') {
    statusFilter = filters;
    search = searchLegacy;
  } else if (filters) {
    statusFilter = filters.status;
    search = filters.search;
    categoryId = filters.categoryId;
    subcategoryId = filters.subcategoryId;
    districtId = filters.districtId;
    serviceId = filters.serviceId;
  }

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (serviceId && serviceId !== 'all') {
    query = query.eq('service_id', serviceId);
  }

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone.ilike.%${search}%,location.ilike.%${search}%,service_name.ilike.%${search}%`
    );
  }

  let dbBookings: Booking[] = [];
  try {
    const { data, error } = await query;
    if (error) {
      console.warn('Database warning in getBookings:', error.message);
    } else if (data) {
      dbBookings = data as Booking[];
    }
  } catch (err) {
    console.warn('Database catch in getBookings:', err);
  }

  // Merge any local fallback bookings
  const localBookings = readLocalBookings();
  const dbIds = new Set(dbBookings.map((b) => b.id));
  const missingFromDb = localBookings.filter((b) => !dbIds.has(b.id));

  let allMerged = [...missingFromDb, ...dbBookings];

  // Apply in-memory filtering if needed for fields not in DB
  if (statusFilter && statusFilter !== 'all') {
    allMerged = allMerged.filter((b) => b.status === statusFilter);
  }
  if (categoryId && categoryId !== 'all') {
    allMerged = allMerged.filter((b) => b.category_id === categoryId);
  }
  if (subcategoryId && subcategoryId !== 'all') {
    allMerged = allMerged.filter((b) => b.subcategory_id === subcategoryId);
  }
  if (districtId && districtId !== 'all') {
    allMerged = allMerged.filter((b) => b.district_id === districtId);
  }
  if (search) {
    const s = search.toLowerCase();
    allMerged = allMerged.filter(
      (b) =>
        b.customer_name?.toLowerCase().includes(s) ||
        b.phone?.toLowerCase().includes(s) ||
        b.location?.toLowerCase().includes(s) ||
        b.service_name?.toLowerCase().includes(s) ||
        b.message?.toLowerCase().includes(s)
    );
  }

  return allMerged;
}

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');

function readLocalBookings(): Booking[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const content = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading local bookings:', err);
  }
  return [];
}

function writeLocalBookings(bookings: Booking[]): void {
  try {
    const dir = path.dirname(BOOKINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local bookings:', err);
  }
}

export async function createBooking(
  booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Booking['status'] }
): Promise<Booking> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();
  const address = booking.address || booking.location;
  let savedFromDb: Booking | null = null;

  try {
    const { data, error } = await client
      .from('bookings')
      .insert({
        customer_name: booking.customer_name,
        phone: booking.phone,
        service_id: booking.service_id || null,
        service_name: booking.service_name,
        location: address,
        preferred_date: booking.preferred_date,
        message: booking.message || '',
        status: booking.status || 'new',
      })
      .select()
      .single();

    if (!error && data) {
      savedFromDb = {
        ...(data as Booking),
        category_id: booking.category_id || undefined,
        category_name: booking.category_name || undefined,
        subcategory_id: booking.subcategory_id || undefined,
        subcategory_name: booking.subcategory_name || undefined,
        district_id: booking.district_id || undefined,
        district_name: booking.district_name || undefined,
      };
    } else if (error) {
      console.warn('Supabase booking insert warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase booking insert catch:', err);
  }

  // Create persistent fallback booking
  const localList = readLocalBookings();
  const fallbackBooking: Booking = savedFromDb || {
    id: `book-${Date.now()}`,
    customer_name: booking.customer_name,
    phone: booking.phone,
    category_id: booking.category_id || undefined,
    category_name: booking.category_name || undefined,
    subcategory_id: booking.subcategory_id || undefined,
    subcategory_name: booking.subcategory_name || undefined,
    service_id: booking.service_id || undefined,
    service_name: booking.service_name,
    district_id: booking.district_id || undefined,
    district_name: booking.district_name || undefined,
    address,
    location: address,
    preferred_date: booking.preferred_date,
    message: booking.message || '',
    status: booking.status || 'new',
    created_at: now,
    updated_at: now,
  };

  localList.unshift(fallbackBooking);
  writeLocalBookings(localList);

  return fallbackBooking;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
  const client = getClientOrThrow();
  let updatedBooking: Booking | null = null;

  try {
    const { data, error } = await client
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      updatedBooking = data as Booking;
    }
  } catch {}

  // Update local
  const localList = readLocalBookings();
  const idx = localList.findIndex((b) => b.id === id);
  if (idx >= 0) {
    localList[idx].status = status;
    localList[idx].updated_at = new Date().toISOString();
    writeLocalBookings(localList);
    if (!updatedBooking) updatedBooking = localList[idx];
  }

  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const client = getClientOrThrow();
  try {
    await client.from('bookings').delete().eq('id', id);
  } catch {}

  // Delete local
  const localList = readLocalBookings();
  writeLocalBookings(localList.filter((b) => b.id !== id));
  return true;
}

// -----------------------------------------------------------------------------
// TESTIMONIALS
// -----------------------------------------------------------------------------
export async function getTestimonials(onlyActive = true): Promise<Testimonial[]> {
  const client = getClientOrThrow();
  let query = client.from('testimonials').select('*').order('display_order', { ascending: true });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Database error in getTestimonials:', error.message);
    throw new Error(`Failed to load testimonials from Supabase: ${error.message}`);
  }

  return (data as Testimonial[]) || [];
}

export async function saveTestimonial(
  testimonial: Partial<Testimonial> & { customer_name: string; review: string }
): Promise<Testimonial> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();

  if (testimonial.id) {
    const { data, error } = await client
      .from('testimonials')
      .update({ ...testimonial, updated_at: now })
      .eq('id', testimonial.id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error saving testimonial: ${error.message}`);
    return data as Testimonial;
  }

  const { data, error } = await client
    .from('testimonials')
    .insert({ ...testimonial, created_at: now, updated_at: now })
    .select()
    .single();

  if (error) throw new Error(`Supabase error creating testimonial: ${error.message}`);
  return data as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const client = getClientOrThrow();
  const { error } = await client.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(`Supabase error deleting testimonial: ${error.message}`);
  return true;
}

// -----------------------------------------------------------------------------
// DASHBOARD STATS
// -----------------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const client = getClientOrThrow();

  const [bookingsRes, servicesRes, categoriesRes, subcategoriesRes, districtsRes, recentBookingsRes] = await Promise.all([
    client.from('bookings').select('status'),
    client.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
    client.from('service_categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
    client.from('subcategories').select('id', { count: 'exact', head: true }).eq('is_active', true),
    client.from('districts').select('id', { count: 'exact', head: true }).eq('is_active', true),
    client.from('bookings').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  const allBookings = bookingsRes.data || [];
  const totalBookings = allBookings.length;
  const newBookings = allBookings.filter((b) => b.status === 'new').length;
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = allBookings.filter((b) => b.status === 'completed').length;
  const totalActiveServices = servicesRes.count ?? 0;
  const totalCategories = categoriesRes.count ?? 0;
  const totalSubcategories = subcategoriesRes.count ?? 0;
  const totalDistricts = districtsRes.count ?? 0;
  const recentBookings = (recentBookingsRes.data as Booking[]) || [];

  return {
    totalBookings,
    newBookings,
    confirmedBookings,
    completedBookings,
    totalActiveServices,
    totalCategories,
    totalSubcategories,
    totalDistricts,
    recentBookings,
  };
}

// -----------------------------------------------------------------------------
// WHY CHOOSE US / ADVANTAGES ACCORDION
// -----------------------------------------------------------------------------
const WHY_CHOOSE_US_FILE = path.join(process.cwd(), 'data', 'why_choose_us.json');

const DEFAULT_WHY_CHOOSE_US: WhyChooseUsSection = {
  heading: 'Why Choose Us',
  subheading: 'ADVANTAGES',
  description: 'We go beyond just service — we deliver trust, quality, and long-term support for your home.',
  image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  items: [
    {
      id: 'item-1',
      question: 'Expert & Certified Technicians',
      answer: 'Our skilled, verified professionals have years of hands-on experience across appliance repair, electrical systems, and home maintenance. We ensure precision diagnosis and safe, lasting repairs on every visit.',
      display_order: 1,
      is_active: true,
    },
    {
      id: 'item-2',
      question: 'Quick & Punctual Doorstep Service',
      answer: 'We value your schedule. Our rapid-dispatch technicians arrive promptly with fully equipped tools and authentic parts to resolve your problems without unnecessary delays.',
      display_order: 2,
      is_active: true,
    },
    {
      id: 'item-3',
      question: 'Transparent Pricing & Authentic Parts',
      answer: 'No surprise fees or hidden charges. We provide upfront, fair pricing before beginning any repair work, using only genuine, manufacturer-backed replacement components.',
      display_order: 3,
      is_active: true,
    },
    {
      id: 'item-4',
      question: 'Safe, Reliable & Satisfaction Guaranteed',
      answer: 'Your complete peace of mind and home safety are our highest priorities. All our work is backed by a satisfaction warranty and friendly post-service support.',
      display_order: 4,
      is_active: true,
    },
  ],
};

export async function getWhyChooseUsData(): Promise<WhyChooseUsSection> {
  const client = getAdminClient();
  if (client) {
    try {
      const { data: sectionData, error: sectionErr } = await client
        .from('why_choose_us_section')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      const { data: itemsData, error: itemsErr } = await client
        .from('why_choose_us_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (!sectionErr && !itemsErr && (sectionData || (itemsData && itemsData.length > 0))) {
        return {
          heading: sectionData?.heading || DEFAULT_WHY_CHOOSE_US.heading,
          subheading: sectionData?.subheading || DEFAULT_WHY_CHOOSE_US.subheading,
          description: sectionData?.description || DEFAULT_WHY_CHOOSE_US.description,
          image_url: sectionData?.image_url || DEFAULT_WHY_CHOOSE_US.image_url,
          items: itemsData && itemsData.length > 0 ? itemsData : DEFAULT_WHY_CHOOSE_US.items,
        };
      }
    } catch {
      // Graceful fallback to local JSON
    }
  }

  try {
    if (fs.existsSync(WHY_CHOOSE_US_FILE)) {
      const content = fs.readFileSync(WHY_CHOOSE_US_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed as WhyChooseUsSection;
      }
    }
  } catch (err) {
    console.error('Error reading why choose us file:', err);
  }
  return DEFAULT_WHY_CHOOSE_US;
}

export async function saveWhyChooseUsData(data: Partial<WhyChooseUsSection>): Promise<WhyChooseUsSection> {
  const current = await getWhyChooseUsData();
  const updated: WhyChooseUsSection = {
    ...current,
    ...data,
    items: data.items || current.items,
  };

  // Sync to Supabase if available
  const client = getAdminClient();
  if (client) {
    try {
      await client.from('why_choose_us_section').upsert({
        id: 'default',
        heading: updated.heading,
        subheading: updated.subheading,
        description: updated.description,
        image_url: updated.image_url,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if table not created yet
    }
  }

  // Always persist to local JSON
  try {
    const dir = path.dirname(WHY_CHOOSE_US_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(WHY_CHOOSE_US_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing why choose us file:', err);
    throw new Error('Failed to save why choose us data');
  }
  return updated;
}

export async function saveWhyChooseUsItem(
  item: Partial<WhyChooseUsItem> & { question: string; answer: string }
): Promise<WhyChooseUsItem> {
  const current = await getWhyChooseUsData();
  const items = [...current.items];

  let savedItem: WhyChooseUsItem;

  if (item.id) {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = {
        ...items[idx],
        ...item,
        id: item.id,
      };
      savedItem = items[idx];
    } else {
      savedItem = {
        id: item.id,
        question: item.question,
        answer: item.answer,
        display_order: item.display_order ?? items.length + 1,
        is_active: item.is_active ?? true,
      };
      items.push(savedItem);
    }
  } else {
    savedItem = {
      id: `wcu-${Date.now()}`,
      question: item.question,
      answer: item.answer,
      display_order: item.display_order ?? items.length + 1,
      is_active: item.is_active ?? true,
    };
    items.push(savedItem);
  }

  // Sync item to Supabase if available
  const client = getAdminClient();
  if (client) {
    try {
      await client.from('why_choose_us_items').upsert({
        id: savedItem.id,
        question: savedItem.question,
        answer: savedItem.answer,
        display_order: savedItem.display_order,
        is_active: savedItem.is_active,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if table not created yet
    }
  }

  await saveWhyChooseUsData({ items });
  return savedItem;
}

export async function deleteWhyChooseUsItem(id: string): Promise<boolean> {
  const current = await getWhyChooseUsData();
  const filtered = current.items.filter((i) => i.id !== id);

  const client = getAdminClient();
  if (client) {
    try {
      await client.from('why_choose_us_items').delete().eq('id', id);
    } catch {
      // Ignore if table not created yet
    }
  }

  await saveWhyChooseUsData({ items: filtered });
  return true;
}
