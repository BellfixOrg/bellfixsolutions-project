-- =============================================================================
-- BRANDS TABLE (WE REPAIR ALL BRANDS)
-- Fixes: "Could not find the table 'public.brands' in the schema cache"
-- Run this in Supabase Dashboard -> SQL Editor. Safe to run more than once.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Brand',
    logo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_display_order ON public.brands(display_order);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);

-- Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on active brands" ON public.brands;
CREATE POLICY "Allow public read access on active brands"
    ON public.brands FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Allow service role full access on brands" ON public.brands;
CREATE POLICY "Allow service role full access on brands"
    ON public.brands FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

-- Table privileges
GRANT ALL ON public.brands TO service_role;
GRANT SELECT ON public.brands TO anon, authenticated;

-- Refresh the API schema cache so the table is visible immediately
NOTIFY pgrst, 'reload schema';

