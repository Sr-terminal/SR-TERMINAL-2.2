import { isAndroidNativeApp } from './authService'

/**
 * Returns the base URL for API requests.
 * Supports VITE_API_BASE_URL override, falls back to Cloud Run URL on Android Native APK,
 * and uses relative paths ('') in Web/SPA mode.
 */
export function getApiBaseUrl(): string {
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL
  if (typeof envBase === 'string' && envBase.trim().length > 0) {
    return envBase.trim().replace(/\/+$/, '')
  }

  if (typeof window === 'undefined') return ''

  if (isAndroidNativeApp()) {
    // In Android Native APK (served via https://localhost/), route API calls to Cloud Run backend
    return 'https://ais-dev-72tc6y7p7dv2upr3ewjnp6-257338808391.asia-east1.run.app'
  }

  // Web Browser / Local Dev: relative path routes to container Express server on port 3000
  return ''
}

export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : '/' + path}`
}
