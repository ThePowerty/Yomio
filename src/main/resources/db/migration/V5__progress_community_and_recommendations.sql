ALTER TABLE catalog_media ADD COLUMN IF NOT EXISTS latest_released_unit INTEGER;
ALTER TABLE catalog_media ADD COLUMN IF NOT EXISTS next_release_at TIMESTAMPTZ;

ALTER TABLE tracked_items ADD COLUMN IF NOT EXISTS catalog_media_id BIGINT;
ALTER TABLE tracked_items ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tracked_items ADD CONSTRAINT fk_tracked_catalog_media
    FOREIGN KEY (catalog_media_id) REFERENCES catalog_media(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tracked_user_media
    ON tracked_items(user_id, catalog_media_id) WHERE catalog_media_id IS NOT NULL;

CREATE TABLE progress_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    catalog_media_id BIGINT NOT NULL REFERENCES catalog_media(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL CHECK (unit_number >= 0),
    volume_number INTEGER CHECK (volume_number >= 0),
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_progress_notes_owner_media ON progress_notes(user_id, catalog_media_id, unit_number DESC);

CREATE TABLE chapter_ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    catalog_media_id BIGINT NOT NULL REFERENCES catalog_media(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL CHECK (unit_number > 0),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_chapter_rating UNIQUE (user_id, catalog_media_id, unit_number)
);

CREATE TABLE community_comments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    catalog_media_id BIGINT NOT NULL REFERENCES catalog_media(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL CHECK (unit_number > 0),
    parent_id BIGINT REFERENCES community_comments(id) ON DELETE CASCADE,
    body VARCHAR(2000) NOT NULL,
    spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_community_media_unit ON community_comments(catalog_media_id, unit_number, created_at);

CREATE TABLE comment_reactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    comment_id BIGINT NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_comment_reaction UNIQUE (user_id, comment_id)
);

CREATE TABLE comment_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    comment_id BIGINT NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
    reason VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_comment_report UNIQUE (user_id, comment_id)
);

CREATE TABLE recommendation_dismissals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    catalog_media_id BIGINT NOT NULL REFERENCES catalog_media(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_recommendation_dismissal UNIQUE (user_id, catalog_media_id)
);
