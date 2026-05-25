-- Create vietnamese text search configuration if it doesn't exist
-- Copying from pg_catalog.simple is the standard way to handle Vietnamese text search
-- in PostgreSQL, as it prevents incorrect English stemming on Vietnamese words.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_ts_config 
        WHERE cfgname = 'vietnamese'
    ) THEN
        CREATE TEXT SEARCH CONFIGURATION public.vietnamese (COPY = pg_catalog.simple);
        RAISE NOTICE 'Created text search configuration "vietnamese" copying from simple.';
    ELSE
        RAISE NOTICE 'Text search configuration "vietnamese" already exists.';
    END IF;
END
$$;
