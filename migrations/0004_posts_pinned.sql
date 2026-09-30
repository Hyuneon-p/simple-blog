ALTER TABLE posts ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1));
CREATE INDEX posts_pinned_created ON posts(created_at DESC, id DESC) WHERE status = 'published' AND is_pinned = 1;
