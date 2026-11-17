DO $$
BEGIN
    IF to_regclass('public.catalog_media') IS NOT NULL THEN
        ALTER TABLE catalog_media DROP CONSTRAINT IF EXISTS catalog_media_type_check;
        ALTER TABLE catalog_media ADD CONSTRAINT catalog_media_type_check
            CHECK (type IN ('ANIME', 'MOVIE', 'MANGA', 'MANHWA'));
    END IF;

    IF to_regclass('public.tracked_items') IS NOT NULL THEN
        ALTER TABLE tracked_items DROP CONSTRAINT IF EXISTS tracked_items_type_check;
        ALTER TABLE tracked_items ADD CONSTRAINT tracked_items_type_check
            CHECK (type IN ('ANIME', 'MOVIE', 'MANGA', 'MANHWA'));
    END IF;
END
$$;
