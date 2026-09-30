<script setup lang="ts">
  const appConfig = useAppConfig()
  useHead(() => ({
    titleTemplate: (title?: string) => title ? `${title} | ${appConfig.title}` : appConfig.title,
  }))

  let themeFadeTimer: ReturnType<typeof setTimeout> | undefined

  function fadeTheme() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    clearTimeout(themeFadeTimer)
    document.documentElement.classList.add('theme-fading')
    themeFadeTimer = setTimeout(() => {
      document.documentElement.classList.remove('theme-fading')
    }, 350)
  }

  onBeforeUnmount(() => {
    clearTimeout(themeFadeTimer)
    if (import.meta.client) document.documentElement.classList.remove('theme-fading')
  })

  const menuItems = [
    { label: '새 글 작성', to: '/admin/editor', external: true },
    { label: '글 관리', to: '/admin/manage', external: true },
    { label: '카테고리 관리', to: '/admin/categories', external: true },
  ]

</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="green" />
    <div class="flex min-h-screen flex-col">
      <UContainer class="max-w-3xl flex-1 py-6">
        <header class="mb-9 flex items-center justify-between border-b border-default pb-6">
          <NuxtLink to="/" class="text-lg font-semibold text-highlighted">{{ appConfig.header }}</NuxtLink>
          <div class="flex items-center gap-2">
            <span class="inline-flex" @click.capture="fadeTheme">
              <UColorModeButton aria-label="라이트/다크 모드 전환" title="라이트/다크 모드 전환" />
            </span>
            <UPopover mode="hover" :open-delay="0" :close-delay="150" enable-touch :content="{ align: 'end', side: 'bottom' }">
              <UButton color="neutral" variant="ghost">관리</UButton>
              <template #content>
                <div class="flex min-w-36 flex-col p-1">
                  <UButton
                    v-for="item in menuItems"
                    :key="item.to"
                    :to="item.to"
                    :external="item.external"
                    color="neutral"
                    variant="ghost"
                  >
                    {{ item.label }}
                  </UButton>
                </div>
              </template>
            </UPopover>
          </div>
        </header>
        <main>
          <NuxtPage />
        </main>
      </UContainer>
      <UFooter>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </UFooter>
    </div>
  </UApp>
</template>
