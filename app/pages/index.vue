<script setup lang="ts">
const { data: pinnedPosts, error: pinnedError, refresh: refreshPinned } = await useFetch('/api/pinned-posts')
const { data: initialPage, error: initialError } = await useFetch('/api/posts')
const posts = ref(initialPage.value?.posts ?? [])
const nextCursor = ref(initialPage.value?.nextCursor ?? null)
const error = ref(!!initialError.value)
const loading = ref(false)
const sentinel = useTemplateRef('sentinel')
let observer: IntersectionObserver | undefined
let controller: AbortController | undefined
let generation = 0
const { data: categories, error: categoryError } = await useFetch('/api/categories')
const selectedCategory = ref<number | null | undefined>(undefined)
const categoryItems = computed(() => [
  { label: '기록', value: undefined },
  ...(categories.value ?? []).map(category => ({
    label: category.name, value: category.id,
  })),
].map(item => ({
  ...item,
  onSelect: () => { selectedCategory.value = item.value },
})))

const categoryLabel = computed(() =>
  (categoryItems.value.find(item => item.value === selectedCategory.value)
    ?? categoryItems.value[0])?.label)
    
async function loadPosts(reset = false) {
  if (!reset && (loading.value || !nextCursor.value)) return
  if (reset) {
    generation++
    controller?.abort()
    posts.value = []
    nextCursor.value = null
  }
  const requestGeneration = generation
  controller = new AbortController()
  loading.value = true
  error.value = false
  try {
    const page = await $fetch('/api/posts', {
      signal: controller.signal,
      query: {
        category: selectedCategory.value === null ? 'uncategorized' : selectedCategory.value,
        cursor: reset ? undefined : nextCursor.value ?? undefined,
      },
    })
    if (requestGeneration !== generation) return
    posts.value = reset ? page.posts : [...posts.value, ...page.posts]
    nextCursor.value = page.nextCursor
  } catch {
    if (requestGeneration === generation) error.value = true
  } finally {
    if (requestGeneration === generation) {
      loading.value = false
      await nextTick()
      // Re-observe after rendering to fill tall viewports as well.
      if (sentinel.value) {
        observer?.unobserve(sentinel.value)
        observer?.observe(sentinel.value)
      }
    }
  }
}

watch(selectedCategory, () => loadPosts(true))
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !error.value) void loadPosts()
  })
  if (sentinel.value) observer.observe(sentinel.value)
})
onBeforeUnmount(() => {
  generation++
  controller?.abort()
  observer?.disconnect()
})
</script>

<template>
  <section class="space-y-6">
    <nav v-if="pinnedPosts?.length" aria-label="고정 글" class="space-y-2 pb-5">
      <NuxtLink
        v-for="post in pinnedPosts"
        :key="post.id"
        :to="`/posts/${encodeURIComponent(post.slug)}`"
        class="flex items-start gap-2 text-sm text-muted hover:text-primary"
      >
        <UIcon name="i-lucide-pin" class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span class="min-w-0 [overflow-wrap:anywhere]">{{ post.title }}</span>
      </NuxtLink>
    </nav>
    <UAlert v-if="pinnedError" color="error" variant="soft" title="고정 글을 불러오지 못했습니다.">
      <template #actions>
        <UButton color="neutral" variant="outline" @click="refreshPinned()">다시 시도</UButton>
      </template>
    </UAlert>
    <h1 class="text-3xl font-bold text-highlighted">
      <UDropdownMenu :items="categoryItems">
        <button type="button" aria-label="카테고리별 글 보기" class="inline-flex max-w-full items-center gap-2 text-left">
          <span class="[overflow-wrap:anywhere]">{{ categoryLabel }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0" />
        </button>
      </UDropdownMenu>
    </h1>
    <UAlert v-if="categoryError" color="error" variant="soft" title="카테고리를 불러오지 못했습니다." />
    <UAlert v-if="error" color="error" variant="soft" title="글을 불러오지 못했습니다." />
    <p v-else-if="!loading && !posts.length" class="text-muted">{{ selectedCategory === undefined ? '아직 발행한 글이 없습니다.' : '이 카테고리에 발행한 글이 없습니다.' }}</p>
    <article v-for="post in posts" :key="post.id" class="space-y-2 border-b border-default py-5">
      <NuxtLink :to="`/posts/${post.slug}`" class="text-lg font-medium break-words text-highlighted hover:text-primary">{{ post.title }}</NuxtLink>
      <p class="text-sm text-muted">{{ post.created_at.slice(0, 10) }}</p>
    </article>
    <div ref="sentinel" class="min-h-1 flex items-center justify-center">
      <p v-if="loading" role="status" class="flex items-center gap-2 text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <span>불러오는 중..</span>
      </p>
      <UButton v-else-if="error" color="neutral" variant="outline" @click="loadPosts(!posts.length)">다시 시도</UButton>
      <UButton v-else-if="nextCursor" color="neutral" variant="ghost" @click="loadPosts()">더 보기</UButton>
    </div>
  </section>
</template>
