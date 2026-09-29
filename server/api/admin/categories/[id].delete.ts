export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = categoryId(event)
  const result = await useDb(event).prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  if (!result.meta.changes) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  return { id }
})
