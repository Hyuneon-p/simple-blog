import type { Post } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { results } = await useDb(event).prepare('SELECT * FROM posts ORDER BY updated_at DESC, id DESC').all<Post>()
  return results
})
