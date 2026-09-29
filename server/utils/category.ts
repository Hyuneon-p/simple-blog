import type { H3Event } from 'h3'

export interface Category { id: number; name: string }

export function categoryId(event: H3Event) {
  const value = getRouterParam(event, 'id') ?? ''
  const id = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category ID' })
  }
  return id
}

export async function readCategoryName(event: H3Event) {
  const input = await readBody(event)
  if (typeof input?.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '카테고리 이름을 입력하세요.' })
  }
  const name = input.name.trim().normalize('NFC')
  if (!name || name.length > 50) {
    throw createError({ statusCode: 400, statusMessage: '카테고리 이름은 1~50자로 입력하세요.' })
  }
  return name
}

export function categoryWriteError(error: unknown): never {
  if (error instanceof Error && /UNIQUE constraint failed: categories\.name/.test(error.message)) {
    throw createError({ statusCode: 409, statusMessage: '이미 있는 카테고리 이름입니다.' })
  }
  throw error
}
