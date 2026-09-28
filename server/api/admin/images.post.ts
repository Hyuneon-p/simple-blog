export default defineEventHandler(async event => {
  await requireAdmin(event)
  if (getHeader(event, 'content-type') !== 'image/webp') {
    throw createError({ statusCode: 415, statusMessage: 'Only WebP images are accepted' })
  }
  const limit = 5 * 1024 * 1024
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of event.node.req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > limit) throw createError({ statusCode: 413, statusMessage: 'Image exceeds 5MB' })
    chunks.push(bytes)
  }
  const body = Buffer.concat(chunks)
  if (!body || body.length < 20 || body.toString('ascii', 0, 4) !== 'RIFF'
    || body.toString('ascii', 8, 12) !== 'WEBP'
    || !['VP8 ', 'VP8L', 'VP8X'].includes(body.toString('ascii', 12, 16))
    || body.readUInt32LE(4) !== body.length - 8) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid WebP image' })
  }
  const key = `${crypto.randomUUID()}.webp`
  await useImageBucket(event).put(key, new Uint8Array(body), {
    httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' },
  })
  setResponseStatus(event, 201)
  return { url: `/images/${key}` }
})
