-- ==========================================================
-- BELL FIX & SOLUTIONS – Supabase Master Database Schema
-- Complete relational schema with RLS, indexes, and seed data
-- ==========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'BELL FIX & SOLUTIONS',
    tagline TEXT DEFAULT 'Professional Home Services. One Trusted Partner.',
    logo_url TEXT DEFAULT '',
    phone TEXT NOT NULL DEFAULT '+971 50 123 4567',
    whatsapp_number TEXT NOT NULL DEFAULT '971501234567',
    email TEXT NOT NULL DEFAULT 'info@bellfixsolutions.com',
    address TEXT NOT NULL DEFAULT 'Dubai, United Arab Emirates',
    about_heading TEXT DEFAULT 'Your Trusted Partner for Reliable Home Services',
    about_description TEXT DEFAULT 'Bell Fix & Solutions provides professional, hassle-free home services, from appliance repairs and installations to cleaning and maintenance. We focus on quality, safety, and customer satisfaction, ensuring your home runs smoothly and comfortably.',
    about_image TEXT DEFAULT 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    facebook_url TEXT DEFAULT 'https://facebook.com',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    twitter_url TEXT DEFAULT 'https://twitter.com',
    linkedin_url TEXT DEFAULT 'https://linkedin.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HERO BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    heading TEXT NOT NULL,
    subheading TEXT,
    description TEXT,
    background_image TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Contact Us',
    cta_url TEXT DEFAULT '/contact',
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICE CATEGORIES TABLE (Main Categories)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon TEXT DEFAULT 'Wrench',
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISTRICTS / LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'Wrench',
    short_description TEXT NOT NULL,
    full_description TEXT,
    main_image TEXT NOT NULL,
    additional_images JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SERVICE DISTRICTS JUNCTION TABLE (Many-to-Many Locations)
CREATE TABLE IF NOT EXISTS public.service_districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_service_district UNIQUE (service_id, district_id)
);

-- 8. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category_id TEXT,
    category_name TEXT,
    subcategory_id TEXT,
    subcategory_name TEXT,
    service_id TEXT,
    service_name TEXT NOT NULL,
    district_id TEXT,
    district_name TEXT,
    address TEXT,
    location TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    role_or_location TEXT DEFAULT 'Homeowner',
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_districts_slug ON public.districts(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON public.services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_service_districts_service_id ON public.service_districts(service_id);
CREATE INDEX IF NOT EXISTS idx_service_districts_district_id ON public.service_districts(district_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_district_id ON public.bookings(district_id);
CREATE INDEX IF NOT EXISTS idx_bookings_category_id ON public.bookings(category_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for public and service_role
CREATE POLICY "Public can view active categories" ON public.service_categories FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access categories" ON public.service_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active subcategories" ON public.subcategories FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access subcategories" ON public.subcategories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active districts" ON public.districts FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access districts" ON public.districts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active services" ON public.services FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access services" ON public.services FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view service districts" ON public.service_districts FOR SELECT TO public USING (true);
CREATE POLICY "Service role full access service districts" ON public.service_districts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role full access bookings" ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access banners" ON public.banners FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Service role full access testimonials" ON public.testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Service role full access site settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
