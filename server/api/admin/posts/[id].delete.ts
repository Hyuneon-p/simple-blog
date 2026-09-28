export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const result = await useDb(event).prepare('DELETE FROM posts WHERE id = ?').bind(postId(event)).run()
  if (!result.meta.changes) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { ok: true }
})
