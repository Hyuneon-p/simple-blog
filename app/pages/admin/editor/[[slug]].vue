<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import TextAlign from '@tiptap/extension-text-align'

const extensions = [TextAlign.configure({ types: ['heading', 'paragraph'] })]

const toolbarItems: EditorToolbarItem[][] = [
  [{ kind: 'undo', icon: 'i-lucide-undo-2' }, 
  { kind: 'redo', icon: 'i-lucide-redo-2' }],

  [  { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
  { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },

  { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
  { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
  { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right' },
  
  { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' }, 
  { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' }, 
  { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' }],

  [{ kind: 'bulletList', icon: 'i-lucide-list' }, 
  { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
  { kind: 'blockquote', icon: 'i-lucide-quote' },
  { kind: 'codeBlock', icon: 'i-lucide-code' }],
]

const route = useRoute()
definePageMeta({ key: route => route.path })

const slug = typeof route.params.slug === 'string' ? route.params.slug : ''
const form = reactive({ title: '', body: '' })
const selectedId = ref<number | null>(null)
const loading = ref(!!slug)
const busy = ref(false)
const error = ref('')
const message = ref('')
const editorRef = useTemplateRef('bodyEditor')

watchEffect(() => {
  editorRef.value?.editor?.setEditable(!busy.value && !loading.value && !error.value)
})

onMounted(async () => {
  if (!slug) return
  try {
    const post = await $fetch(`/api/admin/posts/by-slug/${encodeURIComponent(slug)}`)
    selectedId.value = post.id
    Object.assign(form, { title: post.title, body: post.body })
  } catch (cause: any) { error.value = cause.data?.statusMessage || '글을 불러오지 못했습니다.' }
  finally { loading.value = false }
})

async function save() {
  if (busy.value || loading.value || error.value) return
  busy.value = true
  message.value = ''
  try {
    if (selectedId.value) {
      await $fetch(`/api/admin/posts/${selectedId.value}`, { method: 'PUT', body: form })
      await navigateTo(`/posts/${encodeURIComponent(slug)}`)
    } else {
      const post = await $fetch('/api/admin/posts', { method: 'POST', body: form })
      await navigateTo(`/posts/${encodeURIComponent(post.slug)}`)
    }
  } catch (cause: any) { message.value = cause.data?.statusMessage || '저장하지 못했습니다.' }
  finally { busy.value = false }
}

async function remove() {
  if (!selectedId.value || busy.value || !confirm('이 포스트를 삭제할까요?')) return
  busy.value = true
  try {
    await $fetch(`/api/admin/posts/${selectedId.value}`, { method: 'DELETE' })
    await navigateTo('/admin/manage')
  } catch (cause: any) { message.value = cause.data?.statusMessage || '삭제하지 못했습니다.' }
  finally { busy.value = false }
}
</script>

<template>
  <section class="space-y-8">
    <h1 class="text-3xl font-bold text-highlighted">{{ slug ? "포스트 수정" : "새 포스트 작성" }}</h1>
    <UAlert v-if="error" color="error" :title="error" />
    <p v-if="loading" role="status" class="text-muted">글을 불러오는 중…</p>
    <UCard>
      <!-- <template #header><h2 class="text-lg font-semibold">{{ slug ? '글 수정' : '새 글' }}</h2></template> -->
      <form @submit.prevent="save">
        <fieldset :disabled="busy || loading || !!error" class="space-y-5">
          <UFormField label="제목" name="title" required>
            <UInput v-model="form.title" required :maxlength="200" class="w-full" />
          </UFormField>
          <UFormField label="본문" name="body">
            <ClientOnly>
              <UEditor
                v-if="!loading && !error"
                ref="bodyEditor"
                :key="slug ?? 'new'"
                v-slot="{ editor }"
                v-model="form.body"
                content-type="html"
                :extensions="extensions"
                :editable="!busy && !loading && !error"
                :image="false"
                :mention="false"
                placeholder="본문을 작성하세요…"
                :editor-props="{ attributes: { 'aria-label': '본문' } }"
                :ui="{ content: 'min-h-80 p-4' }"
                class="w-full rounded-md border border-default"
              >
                <UEditorToolbar :editor="editor" :items="toolbarItems" class="flex-wrap border-b border-default p-2" />
              </UEditor>
              <template #fallback>
                <p class="p-4 text-muted">에디터를 불러오는 중…</p>
              </template>
            </ClientOnly>
          </UFormField>
          <div class="flex flex-wrap gap-3">
            <UButton type="submit" :loading="busy" :disabled="loading || !!error">저장</UButton>
            <UButton to="/admin/manage" color="neutral" variant="outline">목록</UButton>
            <UButton v-if="slug" type="button" color="error" variant="soft" :disabled="busy || loading || !!error" @click="remove">삭제</UButton>
          </div>
        </fieldset>
      </form>
    </UCard>
    <p role="status" class="text-sm text-muted">{{ message }}</p>
  </section>
</template>
