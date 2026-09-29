export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = categoryId(event)
  const name = await readCategoryName(event)
  try {
    const result = await useDb(event).prepare('UPDATE categories SET name = ? WHERE id = ?').bind(name, id).run()
    if (!result.meta.changes) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    return { id, name }
  } catch (error) { categoryWriteError(error) }
})
