import slugify from 'slugify'
import type { H3Event } from 'h3'

export async function readPost(event: H3Event) {
  const input = await readBody(event)
  if (!input || typeof input.title !== 'string' || !input.title.trim()
    || input.title.length > 200
    || typeof input.body !== 'string' || input.body.length > 100000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid title or body' })
  }
  const is_pinned = input.is_pinned ?? false
  if (typeof is_pinned !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid pinned flag' })
  }
  const category_id = input.category_id ?? null
  if (category_id !== null) {
    if (!Number.isSafeInteger(category_id) || category_id < 1
      || !await useDb(event).prepare('SELECT id FROM categories WHERE id = ?').bind(category_id).first()) {
      throw createError({ statusCode: 400, statusMessage: '유효한 카테고리를 선택하세요.' })
    }
  }
  return { title: input.title.trim(), body: sanitizeBody(input.body), category_id, is_pinned }
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
