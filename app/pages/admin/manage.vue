<script setup lang="ts">
const { data: posts, error, status } = await useFetch('/api/admin/posts', { server: false })
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-bold text-highlighted">글 관리</h1>
      <UButton to="/admin/editor">새 글 작성</UButton>
    </div>
    <UAlert v-if="error" color="error" title="글을 불러오지 못했습니다." />
    <p v-else-if="status === 'pending' || status === 'idle'" role="status" class="text-muted">글을 불러오는 중…</p>
    <p v-else-if="!posts?.length" class="text-muted">작성한 글이 없습니다.</p>
    <UCard v-for="post in posts" :key="post.id">
      <div class="mb-4 space-y-1">
        <h2 class="font-semibold break-words">{{ post.title }}</h2>
        <p class="text-sm text-muted">{{ post.updated_at.slice(0, 10) }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton :to="`/admin/editor/${encodeURIComponent(post.slug)}`" color="neutral" variant="outline">수정</UButton>
        <!-- <UButton v-if="post.status === 'published'" :to="`/posts/${encodeURIComponent(post.slug)}`" color="neutral" variant="ghost">보기</UButton> -->
      </div>
    </UCard>
  </section>
</template>
