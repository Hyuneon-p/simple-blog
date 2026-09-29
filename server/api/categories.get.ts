import type { Category } from '~~/server/utils/category'

export default defineEventHandler(async (event) => {
  const { results } = await useDb(event).prepare('SELECT id, name FROM categories ORDER BY name, id').all<Category>()
  return results
})
