<script setup lang="ts">
const { data: posts, error } = await useFetch('/api/posts')
const { data: categories, error: categoryError } = await useFetch('/api/categories')
const selectedCategory = ref<number | null | undefined>(undefined)
const categoryItems = computed(() => [
  { label: '기록들', value: undefined },
  { label: '미분류', value: null },
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
    
const filteredPosts = computed(() => (posts.value ?? []).filter(post =>
  selectedCategory.value === undefined || post.category_id === selectedCategory.value))
</script>

<template>
  <section class="space-y-6">
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
    <p v-else-if="!filteredPosts.length" class="text-muted">{{ selectedCategory === undefined ? '아직 발행한 글이 없습니다.' : '이 카테고리에 발행한 글이 없습니다.' }}</p>
    <article v-for="post in filteredPosts" :key="post.id" class="space-y-2 border-b border-default py-5">
      <NuxtLink :to="`/posts/${post.slug}`" class="text-lg font-medium break-words text-highlighted hover:text-primary">{{ post.title }}</NuxtLink>
      <p class="text-sm text-muted">{{ post.created_at.slice(0, 10) }}</p>
    </article>
  </section>
</template>
