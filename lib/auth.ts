import { cookies } from 'next/headers';
import { createServerSupabaseClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/client';

export const ADMIN_COOKIE_NAME = 'bellfix_admin_session';

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (sessionCookie && sessionCookie.value === 'active_authenticated_admin') {
    return true;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }

  return false;
}

