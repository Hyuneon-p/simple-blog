export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = postId(event)
  const post = await readPost(event)
  const result = await useDb(event).prepare('UPDATE posts SET title = ?, body = ?, body_format = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(post.title, post.body, 'html', 'published', new Date().toISOString(), id).run()
  if (!result.meta.changes) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { id }
})
