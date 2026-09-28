<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3'
import { uploadEditorImage } from '~/utils/image-upload'

const props = defineProps<NodeViewProps>()
const file = ref<File | null>(null)
const loading = ref(false)
const error = ref('')
let disposed = false
onBeforeUnmount(() => { disposed = true })

watch(file, async value => {
  if (!value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const result = await uploadEditorImage(value)
    if (disposed || props.editor.isDestroyed) return
    const pos = props.getPos()
    if (typeof pos !== 'number' || props.editor.state.doc.nodeAt(pos)?.type.name !== 'imageUpload') return
    props.editor.chain().focus().insertContentAt(
      { from: pos, to: pos + props.node.nodeSize },
      { type: 'image', attrs: { src: result.url, alt: value.name.replace(/\.[^.]+$/, '') } },
    ).run()
  } catch (cause) {
    if (!disposed) error.value = cause instanceof Error ? cause.message : '이미지 업로드에 실패했습니다.'
  } finally {
    loading.value = false
    file.value = null
  }
})
</script>

<template>
  <NodeViewWrapper :contenteditable="false" class="my-4 space-y-2">
    <UFileUpload
      v-model="file"
      accept="image/jpeg,image/png,image/webp"
      :disabled="loading || !editor.isEditable"
      :preview="false"
      :label="loading ? 'WebP 변환 및 업로드 중…' : '사진을 선택하거나 끌어 놓으세요'"
      description="JPG, PNG, WebP · 최대 10MB · WebP로 변환하여 저장"
      class="min-h-40"
    />
    <p v-if="error" role="alert" class="text-sm text-error">{{ error }}</p>
    <UButton type="button" color="neutral" variant="ghost" :disabled="loading || !editor.isEditable" @click="deleteNode()">취소</UButton>
  </NodeViewWrapper>
</template>
