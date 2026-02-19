export type NetworkScope = 'production' | 'development'

export const NETWORK_SCOPE: NetworkScope =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
