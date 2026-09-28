import slugify from 'slugify'
import type { H3Event } from 'h3'

export async function readPost(event: H3Event) {
  const input = await readBody(event)
  if (!input || typeof input.title !== 'string' || !input.title.trim()
    || input.title.length > 200
    || typeof input.body !== 'string' || input.body.length > 100000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid title or body' })
  }
  return { title: input.title.trim(), body: sanitizeBody(input.body) }
}

// The INSERT's unique constraint, not a separate SELECT, resolves concurrent titles.
export function createPostSlug(title: string) {
  return slugify(title.normalize('NFC'), {
    lower: true, remove: /[^a-zA-Z0-9가-힣\s-]/g,
  }).slice(0, 130).replace(/-+$/g, '') || 'post'
}

export function postId(event: H3Event) {
  const value = getRouterParam(event, 'id') ?? ''
  const id = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid post ID' })
  }
  return id
}

export function isSlugConflict(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed: posts\.slug/.test(error.message)
}
