CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('COMMENT', 'COMPLAINT', 'IMPROVEMENT')),
    subject VARCHAR(120) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_admin_queue ON contact_messages(resolved_at, created_at DESC);
