import type { Post } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { results } = await useDb(event).prepare("SELECT id, slug, title, category_id, created_at, updated_at FROM posts WHERE status = 'published' ORDER BY created_at DESC, id DESC")
    .all<Pick<Post, 'id' | 'slug' | 'title' | 'category_id' | 'created_at' | 'updated_at'>>()
  return results
})
