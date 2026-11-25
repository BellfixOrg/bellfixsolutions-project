-- ==========================================================
-- BELL FIX & SOLUTIONS: Districts & Service Locations Migration
-- Run this in the Supabase Dashboard -> SQL Editor
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create districts / locations table
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create service_districts junction table (Many-to-Many Locations)
CREATE TABLE IF NOT EXISTS public.service_districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_service_district UNIQUE (service_id, district_id)
);

-- 3. Seed initial default districts / locations
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

-- 4. Automatically link existing active services to all active districts
INSERT INTO public.service_districts (service_id, district_id)
SELECT s.id, d.id
FROM public.services s
CROSS JOIN public.districts d
ON CONFLICT (service_id, district_id) DO NOTHING;

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_districts_slug ON public.districts(slug);
CREATE INDEX IF NOT EXISTS idx_districts_active_order ON public.districts(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_service_districts_service_id ON public.service_districts(service_id);
CREATE INDEX IF NOT EXISTS idx_service_districts_district_id ON public.service_districts(district_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_districts ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DROP POLICY IF EXISTS "Public can view active districts" ON public.districts;
CREATE POLICY "Public can view active districts" ON public.districts
    FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access districts" ON public.districts;
CREATE POLICY "Service role full access districts" ON public.districts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view service districts" ON public.service_districts;
CREATE POLICY "Public can view service districts" ON public.service_districts
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Service role full access service districts" ON public.service_districts;
CREATE POLICY "Service role full access service districts" ON public.service_districts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

