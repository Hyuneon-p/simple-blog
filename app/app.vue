<script setup lang="ts">
  const appConfig = useAppConfig()
  useHead(() => ({
    titleTemplate: (title?: string) => title ? `${title} | ${appConfig.title}` : appConfig.title,
  }))

  const menuOpen = ref(false)
  const menuItems = [
    { label: '새 글 작성', to: '/admin/editor', external: true },
    { label: '글 관리', to: '/admin/manage', external: true },
    { label: '카테고리 관리', to: '/admin/categories', external: true },
  ]

  let closeTimer: ReturnType<typeof setTimeout> | undefined

  function openMenu(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    clearTimeout(closeTimer)
    menuOpen.value = true
  }

  function closeMenu(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    closeTimer = setTimeout(() => { menuOpen.value = false }, 150)
  }

  onBeforeUnmount(() => clearTimeout(closeTimer))
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="#2563eb" />
    <div class="flex min-h-screen flex-col">
      <UContainer class="max-w-3xl flex-1 py-6">
        <header class="mb-9 flex items-center justify-between border-b border-default pb-6">
          <NuxtLink to="/" class="text-lg font-semibold text-highlighted">{{ appConfig.title }}</NuxtLink>
          <div class="flex items-center gap-2">
            <UColorModeButton aria-label="라이트/다크 모드 전환" title="라이트/다크 모드 전환" />
            <div @pointerenter="openMenu" @pointerleave="closeMenu">
              <UDropdownMenu v-model:open="menuOpen" :items="menuItems" :modal="false" :portal="false" :content="{ align: 'end', side: 'bottom' }">
                <UButton color="neutral" variant="ghost">관리</UButton>
              </UDropdownMenu>
            </div>
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
