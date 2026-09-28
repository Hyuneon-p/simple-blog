export async function uploadEditorImage(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('JPG, PNG, WebP 이미지를 선택하세요.')
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('원본 이미지는 10MB 이하여야 합니다.')
  const bitmap = await createImageBitmap(file)
  let blob: Blob
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('이미지는 4천만 화소 이하여야 합니다.')
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('이미지 변환을 지원하지 않는 브라우저입니다.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(value => value?.type === 'image/webp'
        ? resolve(value)
        : reject(new Error('WebP 변환에 실패했습니다. 다른 브라우저에서 시도하세요.')), 'image/webp', 0.85)
    })
  } finally {
    bitmap.close()
  }
  if (blob.size > 5 * 1024 * 1024) throw new Error('변환된 이미지가 5MB를 초과합니다.')
  return await $fetch('/api/admin/images', {
    method: 'POST', body: blob, headers: { 'Content-Type': 'image/webp' },
  })
}
