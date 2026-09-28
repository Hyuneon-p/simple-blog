export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key') || ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }
  const object = await useImageBucket(event).get(key)
  if (!object) throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  setHeaders(event, {
    'Content-Type': 'image/webp',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'ETag': object.httpEtag,
    'X-Content-Type-Options': 'nosniff',
  })
  if (getHeader(event, 'if-none-match') === object.httpEtag) {
    setResponseStatus(event, 304)
    return null
  }
  return sendStream(event, object.body as unknown as ReadableStream)
})
