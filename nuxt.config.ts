export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  nitro: { preset: 'cloudflare-module', cloudflare: { deployConfig: true, nodeCompat: true } },
  runtimeConfig: {
    accessTeamDomain: '',
    accessAudience: '',
  },
  app: { head: { htmlAttrs: { lang: 'ko' }, title: 'Simple Blog' } },
})
