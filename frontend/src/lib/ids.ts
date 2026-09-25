export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(16).slice(2)}-${Date.now()}`

export function download(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
