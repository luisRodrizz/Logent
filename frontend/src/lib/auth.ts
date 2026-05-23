export const ACCESS_TOKEN_KEY = 'inventorysaas.accessToken'
export const AUTH_TOKEN_CLEARED_EVENT = 'inventorysaas:auth-token-cleared'

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CLEARED_EVENT))
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken())
}
