// This app does not register a service worker. Keep stale worker requests
// out of the Vue page router without installing an empty replacement worker.
export default defineEventHandler((event) => {
  setResponseStatus(event, 404)
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return 'Service worker not found'
})
