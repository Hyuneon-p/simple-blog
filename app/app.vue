<script setup lang="ts">
const menuOpen = ref(false)
const menuItems = [
  { label: '새 글 작성', to: '/admin/editor', external: true },
  { label: '글 관리', to: '/admin/manage', external: true },
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
    <UContainer class="max-w-3xl py-6">
      <header class="mb-9 flex items-center justify-between border-b border-default pb-6">
        <NuxtLink to="/" class="text-lg font-semibold text-highlighted">Simple Blog</NuxtLink>
        <div @pointerenter="openMenu" @pointerleave="closeMenu">
          <UDropdownMenu v-model:open="menuOpen" :items="menuItems" :modal="false" :portal="false" :content="{ align: 'end', side: 'bottom' }">
            <UButton color="neutral" variant="ghost">관리</UButton>
          </UDropdownMenu>
        </div>
      </header>
      <main><NuxtPage /></main>
    </UContainer>
  </UApp>
</template>
