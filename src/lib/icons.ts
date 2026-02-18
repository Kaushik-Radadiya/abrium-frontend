export const getTokenIconUrl = (symbol: string) =>
  `https://icons-ckg.pages.dev/stargate-light/tokens/${encodeURIComponent(symbol?.toLowerCase())}.svg`

export const getChainIconUrl = (chainKey: string) =>
  `https://icons-ckg.pages.dev/stargate-light/networks/${chainKey?.toLowerCase()}.svg`
