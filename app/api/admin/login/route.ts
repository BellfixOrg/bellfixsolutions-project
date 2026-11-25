import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
            const cookieStore = await cookies();
            cookieStore.set(ADMIN_COOKIE_NAME, 'active_authenticated_admin', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            return NextResponse.json({ success: true, user: data.user });
          }
        }
      } catch (e) {
        console.warn('Supabase auth attempt error:', e);
      }
    }

    // 2. Direct Admin credentials from environment variables
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@bellfix.com').toLowerCase();
    const adminPassword = process.env.ADMIN_SECRET_PASSWORD || 'admin123';
    const inputEmail = email.trim().toLowerCase();

    const isMatch =
      inputEmail === adminEmail ||
      inputEmail === 'admin@bellfix.com' ||
      inputEmail === 'admin@bellfixsolutions.com' ||
      inputEmail === 'admin';

    if (isMatch && password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, 'active_authenticated_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { email: inputEmail, role: 'admin' },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials. Please check your admin email and password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Server authentication failed' }, { status: 500 });
  }
}

