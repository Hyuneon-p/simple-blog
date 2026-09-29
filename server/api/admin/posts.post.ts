export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const post = await readPost(event)
  const now = new Date().toISOString()
  const db = useDb(event)
  const base = createPostSlug(post.title)
  for (let attempt = 0; attempt < 100; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`
    try {
      const result = await db.prepare('INSERT INTO posts (title, slug, body, body_format, status, created_at, updated_at, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(post.title, slug, post.body, 'html', 'published', now, now, post.category_id).run()
      setResponseStatus(event, 201)
      return { id: result.meta.last_row_id, slug }
    } catch (error) {
      if (!isSlugConflict(error)) throw error
    }
  }
  throw createError({ statusCode: 409, statusMessage: 'Too many posts with the same title' })
})
