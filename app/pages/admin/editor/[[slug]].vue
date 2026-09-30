<script setup lang="ts">
import type { EditorCustomHandlers, EditorToolbarItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'
import { ImageUpload } from '~/extensions/image-upload'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'

const extensions = [Youtube.configure({ nocookie: true, addPasteHandler: true }), ImageUpload, TextAlign.configure({ types: ['heading', 'paragraph', 'image'] })]

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
  },
} satisfies EditorCustomHandlers

const toolbarItems: EditorToolbarItem<typeof customHandlers>[][] = [
  [{ kind: 'imageUpload', icon: 'i-lucide-image-plus', tooltip: { text: '사진 업로드' } }],
  [{ kind: 'undo', icon: 'i-lucide-undo-2' }, 
  { kind: 'redo', icon: 'i-lucide-redo-2' }],

  [{ kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
  { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },],
  
  [{ kind: 'bulletList', icon: 'i-lucide-list' }, 
  { kind: 'orderedList', icon: 'i-lucide-list-ordered' },],

  [{ kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
  { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
  { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right' }],
  
  [{ kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
  { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
  { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },],

  [{ kind: 'blockquote', icon: 'i-lucide-quote' },
  { kind: 'codeBlock', icon: 'i-lucide-code' },
  { kind: 'link', icon: 'i-lucide-link' },],
]

const route = useRoute()
definePageMeta({ key: route => route.path })

const slug = typeof route.params.slug === 'string' ? route.params.slug : ''
const form = reactive({ title: '', body: '', category_id: null as number | null, is_pinned: false })
const { data: categories, error: categoryError } = await useFetch('/api/categories')
const categoryItems = computed(() => [
  { label: '미분류', value: 0 },
  ...(categories.value ?? []).map(category => ({ label: category.name, value: category.id })),
])
const selectedCategory = computed({
  get: () => form.category_id ?? 0,
  set: (value: number) => { form.category_id = value === 0 ? null : value },
})
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
    Object.assign(form, { title: post.title, body: post.body, category_id: post.category_id, is_pinned: !!post.is_pinned })
  } catch (cause: any) { error.value = cause.data?.statusMessage || '글을 불러오지 못했습니다.' }
  finally { loading.value = false }
})

async function save() {
  if (busy.value || loading.value || error.value) return
  if (form.body.includes('data-type="image-upload"')) {
    message.value = '이미지 업로드를 완료하거나 업로드 블록을 취소한 뒤 저장하세요.'
    return
  }
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
    <div>
      <!-- <template #header><h2 class="text-lg font-semibold">{{ slug ? '글 수정' : '새 글' }}</h2></template> -->
      <form @submit.prevent="save">
        <fieldset :disabled="busy || loading || !!error" class="min-w-0 space-y-5">
          <UFormField label="제목" name="title" required>
            <UInput v-model="form.title" required :maxlength="200" class="w-full" />
          </UFormField>
          <UFormField label="카테고리" name="category">
            <USelect
              v-model="selectedCategory"
              :items="categoryItems"
              aria-label="카테고리"
              class="w-full"
              :disabled="busy || loading || !!error || !!categoryError"
            />
            <p v-if="categoryError" class="mt-1 text-sm text-error">카테고리를 불러오지 못했습니다. 새로고침해 주세요.</p>
          </UFormField>
          <USwitch
            v-model="form.is_pinned"
            label="고정하기"
            :disabled="busy || loading || !!error"
          />
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
                :handlers="customHandlers"
                :mention="false"
                placeholder="본문을 작성하세요…"
                :editor-props="{ attributes: { 'aria-label': '본문' } }"
                :ui="{ content: 'min-h-80 min-w-0 p-4 [&_.tiptap]:[overflow-wrap:anywhere]' }"
                class="w-full min-w-0 rounded-md border border-default"
              >
                <UEditorToolbar :editor="editor" :items="toolbarItems" class="sticky top-0 z-10 flex-wrap border-b bg-default border-default p-2" />
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
    </div>
    <p role="status" class="text-sm text-muted">{{ message }}</p>
  </section>
</template>
