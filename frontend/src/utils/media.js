export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path
  const apiBase = window.__REPTILE_API__ || import.meta.env.VITE_API_URL || ''
  if (apiBase) return apiBase.replace(/\/api\/?$/, '') + path
  const pathname = window.location.pathname.replace(/\/+$/, '')
  return window.location.origin + pathname + path
}
