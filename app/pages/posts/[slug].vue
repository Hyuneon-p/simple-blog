<script setup lang="ts">
const route = useRoute()
const { data: post, error } = await useFetch(() => `/api/posts/${encodeURIComponent(String(route.params.slug))}`)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusCode === 404 ? 'Post not found' : 'Failed to load post' })
useSeoMeta({ title: () => post.value?.title || 'Simple Blog' })
</script>

<template>
  <article v-if="post" class="space-y-6">
    <h1 class="text-3xl font-bold break-words text-highlighted">{{ post.title }}</h1>
    <p class="text-sm text-muted">{{ post.created_at.slice(0, 10) }}</p>
    <div
      class="leading-8 break-words [&_p]:my-4 [&_h1]:my-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:my-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-default [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-elevated [&_pre]:p-4 [&_code]:font-mono [&_a]:text-primary [&_a]:underline [&_hr]:my-6 [&_hr]:border-default"
      v-html="post.renderedBody"
    />
  </article>
</template>
