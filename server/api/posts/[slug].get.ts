import type { Post } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const post = await useDb(event).prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'").bind(getRouterParam(event, 'slug')!).first<Post>()
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { ...post, renderedBody: renderBody(post.body, post.body_format) }
})
