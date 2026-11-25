-- =============================================================================
-- TABLE PRIVILEGES (GRANTS)
-- Fixes: "permission denied for table <name>" (Postgres error 42501).
-- RLS policies only filter rows; roles still need table-level privileges.
-- Run this in Supabase Dashboard -> SQL Editor.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Server-side admin client (SUPABASE_SERVICE_ROLE_KEY): full access
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Public / logged-in clients: read access (RLS policies still restrict rows)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Public booking form inserts (RLS policy controls what is allowed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    GRANT INSERT ON public.bookings TO anon, authenticated;
  END IF;
END $$;

-- Apply the same privileges to tables created in the future
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

