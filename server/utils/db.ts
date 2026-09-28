import type { H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

export interface Post {
  id: number
  slug: string
  title: string
  body: string
  body_format: 'markdown' | 'html'
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export function useDb(event: H3Event): D1Database {
  const db = event.context.cloudflare?.env?.DB
  if (!db) throw createError({ statusCode: 503, statusMessage: 'D1 binding is unavailable' })
  return db
}
