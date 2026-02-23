export type NetworkScope = 'production' | 'development'

export const NETWORK_SCOPE: NetworkScope =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'production' : 'development'
