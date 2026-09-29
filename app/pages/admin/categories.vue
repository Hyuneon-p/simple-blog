<script setup lang="ts">
const { data: categories, error, status, refresh } = await useFetch('/api/categories', { server: false })
const name = ref('')
const editingId = ref<number | null>(null)
const busy = ref(false)
const message = ref('')

function reset() {
  editingId.value = null
  name.value = ''
}

async function save() {
  if (busy.value || !name.value.trim()) return
  busy.value = true
  message.value = ''
  try {
    if (editingId.value !== null) {
      await $fetch(`/api/admin/categories/${editingId.value}`, { method: 'PUT', body: { name: name.value } })
    } else {
      await $fetch('/api/admin/categories', { method: 'POST', body: { name: name.value } })
    }
    reset()
    await refresh()
  } catch (cause: any) { message.value = cause.data?.statusMessage || '카테고리를 저장하지 못했습니다.' }
  finally { busy.value = false }
}

async function remove(id: number) {
  if (busy.value || !confirm('카테고리를 삭제할까요? 해당 글은 미분류로 변경되며 삭제되지 않습니다.')) return
  busy.value = true
  message.value = ''
  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (editingId.value === id) reset()
    await refresh()
  } catch (cause: any) { message.value = cause.data?.statusMessage || '카테고리를 삭제하지 못했습니다.' }
  finally { busy.value = false }
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-3xl font-bold text-highlighted">카테고리 관리</h1>
    <form class="space-y-3" @submit.prevent="save">
      <UFormField :label="editingId === null ? '새 카테고리' : '카테고리 이름 수정'" name="name" required>
        <UInput v-model="name" required :maxlength="50" :disabled="busy" class="w-full" placeholder="카테고리 이름" />
      </UFormField>
      <div class="flex gap-2">
        <UButton type="submit" :loading="busy" :disabled="!name.trim()">{{ editingId === null ? '추가' : '저장' }}</UButton>
        <UButton v-if="editingId !== null" color="neutral" variant="outline" :disabled="busy" @click="reset">취소</UButton>
      </div>
    </form>
    <p v-if="message" role="alert" class="text-sm text-error">{{ message }}</p>
    <UAlert v-if="error" color="error" title="카테고리를 불러오지 못했습니다." />
    <p v-else-if="status === 'pending' || status === 'idle'" role="status" class="text-muted">카테고리를 불러오는 중…</p>
    <p v-else-if="!categories?.length" class="text-muted">등록한 카테고리가 없습니다.</p>
    <ul v-else class="divide-y divide-default">
      <li v-for="category in categories" :key="category.id" class="flex items-center justify-between gap-3 py-4">
        <span class="min-w-0 [overflow-wrap:anywhere]">{{ category.name }}</span>
        <div class="flex shrink-0 gap-2">
          <UButton color="neutral" variant="outline" :disabled="busy" @click="editingId = category.id; name = category.name; message = ''">수정</UButton>
          <UButton color="error" variant="soft" :disabled="busy" @click="remove(category.id)">삭제</UButton>
        </div>
      </li>
    </ul>
    <UButton to="/admin/manage" color="neutral" variant="outline">글 관리</UButton>
  </section>
</template>
