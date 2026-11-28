import { Brand } from '@/types';
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

export async function getBrands(onlyActive = true): Promise<Brand[]> {
  const client = getClientOrThrow();
  let query = client.from('brands').select('*').order('display_order', { ascending: true });
  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Database error in getBrands:', error.message);
    throw new Error(`Failed to load brands: ${error.message}`);
  }

  return (data as Brand[]) || [];
}

export async function saveBrand(
  brand: Partial<Brand> & { logo_url: string; name?: string }
): Promise<Brand> {
  const client = getClientOrThrow();
  const now = new Date().toISOString();

  const payload = {
    name: brand.name || 'Brand',
    logo_url: brand.logo_url,
    display_order: brand.display_order ?? 1,
    is_active: brand.is_active ?? true,
    updated_at: now,
  };

  const { data, error } = brand.id
    ? await client.from('brands').update(payload).eq('id', brand.id).select().single()
    : await client
        .from('brands')
        .insert({ ...payload, created_at: now })
        .select()
        .single();

  if (error) {
    console.error('Supabase error saving brand:', error.message);
    throw new Error(`Failed to save brand: ${error.message}`);
  }

  return data as Brand;
}

export async function deleteBrand(id: string): Promise<boolean> {
  const client = getClientOrThrow();
  const { error } = await client.from('brands').delete().eq('id', id);
  if (error) {
    console.error('Supabase error deleting brand:', error.message);
    throw new Error(`Failed to delete brand: ${error.message}`);
  }
  return true;
}
