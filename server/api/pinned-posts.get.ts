import type { Post } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { results } = await useDb(event)
    .prepare("SELECT id, slug, title FROM posts WHERE status = 'published' AND is_pinned = 1 ORDER BY created_at DESC, id DESC")
    .all<Pick<Post, 'id' | 'slug' | 'title'>>()
  return results
})
