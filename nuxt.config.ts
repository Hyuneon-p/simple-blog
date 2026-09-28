export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  vite: {
    // Keep Nuxt UI and custom Tiptap nodes on the same ProseMirror instances.
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
      ],
    },
  },
  nitro: { preset: 'cloudflare-module', cloudflare: { deployConfig: true, nodeCompat: true } },
  runtimeConfig: {
    accessTeamDomain: '',
    accessAudience: '',
  },
  app: { head: { htmlAttrs: { lang: 'ko' } } },
})
