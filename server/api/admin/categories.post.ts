export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = await readCategoryName(event)
  try {
    const result = await useDb(event).prepare('INSERT INTO categories (name) VALUES (?)').bind(name).run()
    setResponseStatus(event, 201)
    return { id: result.meta.last_row_id, name }
  } catch (error) { categoryWriteError(error) }
})
