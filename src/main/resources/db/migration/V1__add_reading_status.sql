DO $$
BEGIN
    IF to_regclass('public.tracked_items') IS NOT NULL THEN
        ALTER TABLE tracked_items
            ADD COLUMN IF NOT EXISTS reading_status VARCHAR(24);

        UPDATE tracked_items
        SET reading_status = CASE
            WHEN finished THEN 'COMPLETED'
            ELSE 'READING'
        END
        WHERE reading_status IS NULL;

        ALTER TABLE tracked_items
            ALTER COLUMN reading_status SET NOT NULL;
    END IF;
END
$$;
