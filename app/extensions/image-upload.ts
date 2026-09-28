import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageUploadNode from '~/components/ImageUploadNode.vue'

// Nuxt UI Editor's image-upload example: a temporary node backed by UFileUpload.
export const ImageUpload = Node.create({
  name: 'imageUpload',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'div[data-type="image-upload"]' }],
  renderHTML: () => ['div', { 'data-type': 'image-upload' }],
  addNodeView() { return VueNodeViewRenderer(ImageUploadNode) },
})
