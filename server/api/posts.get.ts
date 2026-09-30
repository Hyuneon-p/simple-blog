import type { Post } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const conditions = ["status = 'published'"]
  const values: (string | number)[] = []
  if (query.category !== undefined) {
    if (query.category === 'uncategorized') {
      conditions.push('category_id IS NULL')
    } else {
      const category = Number(query.category)
      if (typeof query.category !== 'string' || !/^[0-9]+$/.test(query.category) || !Number.isSafeInteger(category) || category < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid category' })
      }
      conditions.push('category_id = ?')
      values.push(category)
    }
  }
  if (query.cursor !== undefined) {
    try {
      if (typeof query.cursor !== 'string' || query.cursor.length > 256) throw new Error()
      const cursor = JSON.parse(query.cursor)
      if (!cursor || typeof cursor.created_at !== 'string' || cursor.created_at.length > 64
        || !Number.isFinite(Date.parse(cursor.created_at)) || !Number.isSafeInteger(cursor.id) || cursor.id < 1) throw new Error()
      conditions.push('(created_at, id) < (?, ?)')
      values.push(cursor.created_at, cursor.id)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid cursor' })
    }
  }
  // The extra row tells us whether another page exists.
  const { results } = await useDb(event).prepare(`SELECT id, slug, title, category_id, created_at, updated_at FROM posts WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC, id DESC LIMIT 21`)
    .bind(...values)
    .all<Pick<Post, 'id' | 'slug' | 'title' | 'category_id' | 'created_at' | 'updated_at'>>()
  const posts = results.slice(0, 20)
  const last = posts.at(-1)
  return {
    posts,
    nextCursor: results.length > 20 && last ? JSON.stringify({ created_at: last.created_at, id: last.id }) : null,
  }
})
