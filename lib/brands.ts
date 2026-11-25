import fs from 'fs';
import path from 'path';
import { Brand } from '@/types';
import { getAdminClient } from './supabase/admin';

const BRANDS_FILE = path.join(process.cwd(), 'data', 'brands.json');

export function readLocalBrands(): Brand[] {
  try {
    if (fs.existsSync(BRANDS_FILE)) {
      const content = fs.readFileSync(BRANDS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local brands:', err);
  }
  return [];
}

export function writeLocalBrands(brands: Brand[]): void {
  try {
    const dir = path.dirname(BRANDS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BRANDS_FILE, JSON.stringify(brands, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local brands:', err);
  }
}

export async function getBrands(onlyActive = true): Promise<Brand[]> {
  try {
    const client = getAdminClient();
    if (client) {
      let query = client.from('brands').select('*').order('display_order', { ascending: true });
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as Brand[];
      }
    }
  } catch (err) {
    console.warn('Supabase getBrands error, using local fallback:', err);
  }

  const localList = readLocalBrands();
  return onlyActive ? localList.filter((b) => b.is_active) : localList;
}

export async function saveBrand(
  brand: Partial<Brand> & { logo_url: string; name?: string }
): Promise<Brand> {
  const client = getAdminClient();
  const now = new Date().toISOString();
  let savedBrand: Brand | null = null;

  try {
    if (client) {
      if (brand.id && !brand.id.startsWith('brand-')) {
        const { data, error } = await client
          .from('brands')
          .update({
            name: brand.name || 'Brand',
            logo_url: brand.logo_url,
            display_order: brand.display_order ?? 1,
            is_active: brand.is_active ?? true,
            updated_at: now,
          })
          .eq('id', brand.id)
          .select()
          .maybeSingle();

        if (!error && data) savedBrand = data as Brand;
      } else {
        const { data, error } = await client
          .from('brands')
          .insert({
            name: brand.name || 'Brand',
            logo_url: brand.logo_url,
            display_order: brand.display_order ?? 1,
            is_active: brand.is_active ?? true,
            created_at: now,
            updated_at: now,
          })
          .select()
          .maybeSingle();

        if (!error && data) savedBrand = data as Brand;
      }
    }
  } catch (err) {
    console.warn('Supabase saveBrand error, using local storage:', err);
  }

  // Update local file
  const localList = readLocalBrands();
  if (brand.id) {
    const idx = localList.findIndex((b) => b.id === brand.id);
    if (idx !== -1) {
      savedBrand = {
        ...localList[idx],
        ...brand,
        name: brand.name || localList[idx].name || 'Brand',
        updated_at: now,
      } as Brand;
      localList[idx] = savedBrand;
    }
  }

  if (!savedBrand) {
    savedBrand = {
      id: brand.id || `brand-${Date.now()}`,
      name: brand.name || 'Brand',
      logo_url: brand.logo_url,
      display_order: brand.display_order ?? localList.length + 1,
      is_active: brand.is_active ?? true,
      created_at: now,
      updated_at: now,
    };
    localList.push(savedBrand);
  }

  writeLocalBrands(localList);
  return savedBrand;
}

export async function deleteBrand(id: string): Promise<boolean> {
  try {
    const client = getAdminClient();
    if (client && !id.startsWith('brand-')) {
      await client.from('brands').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteBrand error, proceeding with local delete:', err);
  }

  const localList = readLocalBrands();
  const filtered = localList.filter((b) => b.id !== id);
  writeLocalBrands(filtered);
  return true;
}

