ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS policies_version VARCHAR(20);

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    IF to_regclass('public.tracked_items') IS NOT NULL THEN
        FOR constraint_name IN
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'tracked_items'::regclass
              AND confrelid = 'usuarios'::regclass
              AND contype = 'f'
        LOOP
            EXECUTE format('ALTER TABLE tracked_items DROP CONSTRAINT %I', constraint_name);
        END LOOP;
        ALTER TABLE tracked_items
            ADD CONSTRAINT fk_tracked_items_user
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    IF to_regclass('public.community_comments') IS NOT NULL THEN
        FOR constraint_name IN
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'community_comments'::regclass
              AND confrelid = 'community_comments'::regclass
              AND contype = 'f'
        LOOP
            EXECUTE format('ALTER TABLE community_comments DROP CONSTRAINT %I', constraint_name);
        END LOOP;
        ALTER TABLE community_comments
            ADD CONSTRAINT fk_community_comments_parent
            FOREIGN KEY (parent_id) REFERENCES community_comments(id) ON DELETE SET NULL;
    END IF;
END $$;
