DO $$
BEGIN
    IF to_regclass('public.catalog_media') IS NOT NULL THEN
        ALTER TABLE catalog_media
            ADD COLUMN IF NOT EXISTS title_localized VARCHAR(220);
        ALTER TABLE catalog_media
            ADD COLUMN IF NOT EXISTS aliases VARCHAR(2000);
    END IF;
END
$$;
