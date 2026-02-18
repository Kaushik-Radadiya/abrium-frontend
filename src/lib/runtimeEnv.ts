export type NetworkScope = 'production' | 'development' | 'all'

function parseScope(value?: string): NetworkScope | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'production' ||
    normalized === 'development' ||
    normalized === 'all'
  ) {
    return normalized
  }
  return null
}

const scopeFromEnv = parseScope(process.env.NEXT_PUBLIC_NETWORK_SCOPE)
const scopeFromNodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'

export const NETWORK_SCOPE: NetworkScope = scopeFromEnv ?? scopeFromNodeEnv
