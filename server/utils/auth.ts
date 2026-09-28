import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

let keys: ReturnType<typeof createRemoteJWKSet> | undefined

export async function requireAdmin(event: H3Event) {
  setHeader(event, 'Cache-Control', 'no-store')
  // Cookie-based Access authentication also needs CSRF protection for mutations.
  if (!['GET', 'HEAD'].includes(event.method)) {
    const origin = getHeader(event, 'origin')
    const host = getHeader(event, 'host')
    let originHost: string | undefined
    try { originHost = origin ? new URL(origin).host : undefined } catch {}
    if (!originHost || originHost !== host) {
      throw createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
    }
  }
  // This branch is compiled out of production builds.
  if (import.meta.dev) return
  const config = useRuntimeConfig(event)
  if (!config.accessTeamDomain || !config.accessAudience) {
    throw createError({ statusCode: 503, statusMessage: 'Cloudflare Access is not configured' })
  }
  const token = getHeader(event, 'cf-access-jwt-assertion')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  const issuer = `https://${config.accessTeamDomain}`
  keys ??= createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))
  try {
    await jwtVerify(token, keys, {
      issuer, audience: config.accessAudience, algorithms: ['RS256'],
      requiredClaims: ['exp', 'sub', 'email'],
    })
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Access token' })
  }
}
