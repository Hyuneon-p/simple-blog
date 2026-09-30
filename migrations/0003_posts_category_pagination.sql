CREATE INDEX posts_published_category_created ON posts(status, category_id, created_at DESC, id DESC);
