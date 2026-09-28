import type { H3Event } from 'h3'
import type { R2Bucket } from '@cloudflare/workers-types'

export function useImageBucket(event: H3Event): R2Bucket {
  const bucket = event.context.cloudflare?.env?.IMAGES
  if (!bucket) throw createError({ statusCode: 503, statusMessage: 'R2 binding is unavailable' })
  return bucket
}
