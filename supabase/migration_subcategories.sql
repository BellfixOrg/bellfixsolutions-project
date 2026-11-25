-- ==========================================================
-- BELL FIX & SOLUTIONS: Complete Category & Subcategory Migration
-- Safe & idempotent script for Supabase SQL Editor
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure service_categories table exists
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

-- Seed Main Categories if missing
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

-- 2. Create subcategories table
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

-- 3. Add subcategory_id column to services table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'subcategory_id'
    ) THEN
        ALTER TABLE public.services ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Add subcategory_id and subcategory_name to bookings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'subcategory_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN subcategory_id TEXT;
        ALTER TABLE public.bookings ADD COLUMN subcategory_name TEXT;
    END IF;
END $$;

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_active_order ON public.subcategories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON public.services(subcategory_id);

-- 6. Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DROP POLICY IF EXISTS "Public can view active categories" ON public.service_categories;
CREATE POLICY "Public can view active categories" ON public.service_categories
    FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access categories" ON public.service_categories;
CREATE POLICY "Service role full access categories" ON public.service_categories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active subcategories" ON public.subcategories;
CREATE POLICY "Public can view active subcategories" ON public.subcategories
    FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access subcategories" ON public.subcategories;
CREATE POLICY "Service role full access subcategories" ON public.subcategories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. Seed Initial Subcategories (Dynamically using category slugs so no FK errors occur)
DO $$
DECLARE
    repair_id UUID;
    cleaning_id UUID;
BEGIN
    SELECT id INTO repair_id FROM public.service_categories WHERE slug = 'repair-services' LIMIT 1;
    SELECT id INTO cleaning_id FROM public.service_categories WHERE slug = 'cleaning-services' LIMIT 1;

    -- Repair Subcategories
    IF repair_id IS NOT NULL THEN
        INSERT INTO public.subcategories (category_id, name, slug, description, icon, display_order, is_active)
        VALUES
        (
            repair_id,
            'Air Conditioner',
            'air-conditioner',
            'Comprehensive AC servicing, filter cleaning, gas refilling, and quick cooling fixes.',
            'Snowflake',
            1,
            true
        ),
        (
            repair_id,
            'Washing Machine',
            'washing-machine',
            'Front-load and top-load repairs, motor fixes, drainage issues, and drum cleaning.',
            'Waves',
            2,
            true
        ),
        (
            repair_id,
            'Refrigerator',
            'refrigerator',
            'Cooling fault diagnostics, compressor fixes, thermostat repair, and gas refilling.',
            'Refrigerator',
            3,
            true
        ),
        (
            repair_id,
            'Freezer',
            'freezer',
            'Deep freezer servicing, defrosting issues, fan motor fixes, and insulation check.',
            'Snowflake',
            4,
            true
        ),
        (
            repair_id,
            'CCTV',
            'cctv',
            'HD and IP camera installation, DVR/NVR configuration, and mobile remote access.',
            'Camera',
            5,
            true
        )
        ON CONFLICT (slug) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            display_order = EXCLUDED.display_order,
            is_active = EXCLUDED.is_active;
    END IF;

    -- Cleaning Subcategories
    IF cleaning_id IS NOT NULL THEN
        INSERT INTO public.subcategories (category_id, name, slug, description, icon, display_order, is_active)
        VALUES
        (
            cleaning_id,
            'Deep Cleaning',
            'deep-cleaning',
            'Full home sanitization, kitchen degreasing, bathroom scrubbing, and upholstery care.',
            'Sparkles',
            1,
            true
        ),
        (
            cleaning_id,
            'Interlock Cleaning',
            'interlock-cleaning',
            'High-pressure jet washing, moss and weed removal, driveway re-sanding, and sealing.',
            'Layers',
            2,
            true
        ),
        (
            cleaning_id,
            'Water Tank Cleaning',
            'water-tank-cleaning',
            'Municipal-grade tank disinfection, sludge removal, and pure water testing.',
            'Droplets',
            3,
            true
        )
        ON CONFLICT (slug) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            display_order = EXCLUDED.display_order,
            is_active = EXCLUDED.is_active;
    END IF;
END $$;

-- 9. Link existing services to their respective subcategories automatically
UPDATE public.services s
SET subcategory_id = sub.id
FROM public.subcategories sub
WHERE s.slug = sub.slug;
