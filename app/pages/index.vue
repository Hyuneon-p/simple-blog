<script setup lang="ts">
const { data: posts, error } = await useFetch('/api/posts')
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-3xl font-bold text-highlighted">기록</h1>
    <UAlert v-if="error" color="error" variant="soft" title="글을 불러오지 못했습니다." />
    <p v-else-if="!posts?.length" class="text-muted">아직 발행한 글이 없습니다.</p>
    <article v-for="post in posts" :key="post.id" class="space-y-2 border-b border-default py-5">
      <NuxtLink :to="`/posts/${post.slug}`" class="text-lg font-medium break-words text-highlighted hover:text-primary">{{ post.title }}</NuxtLink>
      <p class="text-sm text-muted">{{ post.created_at.slice(0, 10) }}</p>
    </article>
  </section>
</template>
