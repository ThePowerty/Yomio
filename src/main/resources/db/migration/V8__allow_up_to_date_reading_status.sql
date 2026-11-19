DO $$
BEGIN
    IF to_regclass('public.tracked_items') IS NOT NULL THEN
        ALTER TABLE tracked_items
            DROP CONSTRAINT IF EXISTS tracked_items_reading_status_check;
        ALTER TABLE tracked_items
            ADD CONSTRAINT tracked_items_reading_status_check
            CHECK (reading_status IN (
                'PLAN_TO_READ',
                'READING',
                'PAUSED',
                'UP_TO_DATE',
                'COMPLETED',
                'DROPPED'
            ));
    END IF;
END
$$;
