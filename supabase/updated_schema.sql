-- ==========================================================
-- BELL FIX & SOLUTIONS – Supabase Master Database Schema (Updated)
-- Complete relational schema with RLS, indexes, and seed data
-- Safe & idempotent: can be run in Supabase SQL Editor anytime.
-- ==========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. SITE SETTINGS TABLE
-- ==========================================================
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

-- ==========================================================
-- 2. HERO BANNERS TABLE (Includes mobile_image_url)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    heading TEXT NOT NULL,
    subheading TEXT,
    description TEXT,
    background_image TEXT NOT NULL,
    mobile_image_url TEXT,
    cta_text TEXT DEFAULT 'Contact Us',
    cta_url TEXT DEFAULT '/contact',
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure mobile_image_url exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'banners' AND column_name = 'mobile_image_url'
    ) THEN
        ALTER TABLE public.banners ADD COLUMN mobile_image_url TEXT;
    END IF;
END $$;

-- ==========================================================
-- 3. SERVICE CATEGORIES TABLE (Main Categories)
-- ==========================================================
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

-- ==========================================================
-- 4. SUBCATEGORIES TABLE
-- ==========================================================
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

-- ==========================================================
-- 5. DISTRICTS / LOCATIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 6. SERVICES TABLE
-- ==========================================================
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

-- Ensure subcategory_id exists if services table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'subcategory_id'
    ) THEN
        ALTER TABLE public.services ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==========================================================
-- 7. SERVICE DISTRICTS JUNCTION TABLE (Many-to-Many Locations)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.service_districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_service_district UNIQUE (service_id, district_id)
);

-- ==========================================================
-- 8. WHY CHOOSE US SECTION & ACCORDION ITEMS TABLES
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.why_choose_us_section (
    id TEXT PRIMARY KEY DEFAULT 'default',
    heading TEXT NOT NULL DEFAULT 'Why Choose Us',
    subheading TEXT DEFAULT 'ADVANTAGES',
    description TEXT DEFAULT 'We go beyond just service — we deliver trust, quality, and long-term support for your home.',
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.why_choose_us_items (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 9. BOOKINGS TABLE
-- ==========================================================
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

-- ==========================================================
-- 10. TESTIMONIALS TABLE
-- ==========================================================
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

-- ==========================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_districts_slug ON public.districts(slug);
CREATE INDEX IF NOT EXISTS idx_districts_active_order ON public.districts(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON public.services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_service_districts_service_id ON public.service_districts(service_id);
CREATE INDEX IF NOT EXISTS idx_service_districts_district_id ON public.service_districts(district_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_district_id ON public.bookings(district_id);
CREATE INDEX IF NOT EXISTS idx_bookings_category_id ON public.bookings(category_id);
CREATE INDEX IF NOT EXISTS idx_why_choose_us_items_order ON public.why_choose_us_items(display_order);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_us_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_us_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES (Public read active, service_role full access)
-- ==========================================================
DROP POLICY IF EXISTS "Public can view active categories" ON public.service_categories;
CREATE POLICY "Public can view active categories" ON public.service_categories FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access categories" ON public.service_categories;
CREATE POLICY "Service role full access categories" ON public.service_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active subcategories" ON public.subcategories;
CREATE POLICY "Public can view active subcategories" ON public.subcategories FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access subcategories" ON public.subcategories;
CREATE POLICY "Service role full access subcategories" ON public.subcategories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active districts" ON public.districts;
CREATE POLICY "Public can view active districts" ON public.districts FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access districts" ON public.districts;
CREATE POLICY "Service role full access districts" ON public.districts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access services" ON public.services;
CREATE POLICY "Service role full access services" ON public.services FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view service districts" ON public.service_districts;
CREATE POLICY "Public can view service districts" ON public.service_districts FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Service role full access service districts" ON public.service_districts;
CREATE POLICY "Service role full access service districts" ON public.service_districts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view why choose us section" ON public.why_choose_us_section;
CREATE POLICY "Public can view why choose us section" ON public.why_choose_us_section FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Service role full access why choose us section" ON public.why_choose_us_section;
CREATE POLICY "Service role full access why choose us section" ON public.why_choose_us_section FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active why choose us items" ON public.why_choose_us_items;
CREATE POLICY "Public can view active why choose us items" ON public.why_choose_us_items FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access why choose us items" ON public.why_choose_us_items;
CREATE POLICY "Service role full access why choose us items" ON public.why_choose_us_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access bookings" ON public.bookings;
CREATE POLICY "Service role full access bookings" ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access banners" ON public.banners;
CREATE POLICY "Service role full access banners" ON public.banners FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "Service role full access testimonials" ON public.testimonials;
CREATE POLICY "Service role full access testimonials" ON public.testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Service role full access site settings" ON public.site_settings;
CREATE POLICY "Service role full access site settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================================
-- DEFAULT SEED DATA
-- ==========================================================

-- Seed default site settings
INSERT INTO public.site_settings (id, business_name, tagline, phone, whatsapp_number, email, address)
VALUES (
    'default',
    'BELL FIX & SOLUTIONS',
    'Professional Home Services. One Trusted Partner.',
    '+91 97782 15489',
    '919778215489',
    'info@bellfixsolutions.com',
    'Kerala, India'
)
ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    whatsapp_number = EXCLUDED.whatsapp_number;

-- Seed default districts
INSERT INTO public.districts (name, slug, display_order, is_active)
VALUES
    ('Calicut', 'calicut', 1, true),
    ('Trivandrum', 'trivandrum', 2, true),
    ('Kochi', 'kochi', 3, true),
    ('Malappuram', 'malappuram', 4, true),
    ('Thrissur', 'thrissur', 5, true),
    ('Kannur', 'kannur', 6, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Seed default main categories
INSERT INTO public.service_categories (name, slug, description, display_order, is_active)
VALUES
(
    'Repair Services',
    'repair-services',
    'Fast, certified doorstep repair solutions for all major household electronics & appliances.',
    1,
    true
),
(
    'Cleaning Services',
    'cleaning-services',
    'Professional deep cleaning, water tank sanitization, and interlock pressure jet washing.',
    2,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Seed default Why Choose Us section
INSERT INTO public.why_choose_us_section (id, heading, subheading, description, image_url)
VALUES (
    'default',
    'Why Choose Us',
    'ADVANTAGES',
    'We go beyond just service — we deliver trust, quality, and long-term support for your home.',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop'
)
ON CONFLICT (id) DO UPDATE SET
    heading = EXCLUDED.heading,
    subheading = EXCLUDED.subheading,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

-- Seed default Why Choose Us accordion items
INSERT INTO public.why_choose_us_items (id, question, answer, display_order, is_active)
VALUES
(
    'item-1',
    'Expert & Certified Technicians',
    'Our skilled, verified professionals have years of hands-on experience across appliance repair, electrical systems, and home maintenance. We ensure precision diagnosis and safe, lasting repairs on every visit.',
    1,
    true
),
(
    'item-2',
    'Quick & Punctual Doorstep Service',
    'We value your schedule. Our rapid-dispatch technicians arrive promptly with fully equipped tools and authentic parts to resolve your problems without unnecessary delays.',
    2,
    true
),
(
    'item-3',
    'Transparent Pricing & Authentic Parts',
    'No surprise fees or hidden charges. We provide upfront, fair pricing before beginning any repair work, using only genuine, manufacturer-backed replacement components.',
    3,
    true
),
(
    'item-4',
    'Safe, Reliable & Satisfaction Guaranteed',
    'Your complete peace of mind and home safety are our highest priorities. All our work is backed by a satisfaction warranty and friendly post-service support.',
    4,
    true
)
ON CONFLICT (id) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

