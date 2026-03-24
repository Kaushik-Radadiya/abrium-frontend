export type IntentType = 'swap' | 'limit' | 'dca';

export type ApprovalMethod = 'permit' | 'exact' | 'none';

export type SwapIntent = {
  // Version — allows schema upgrades without breaking stored intents
  intentVersion: '1.0.0';

  // Which mode created this intent
  intentType: IntentType;

  // Source chain + token
  chainIn: number; // e.g. 1 (Ethereum)
  tokenIn: string; // token address or 'native' for ETH/MATIC/BNB

  // Destination chain + token
  chainOut: number; // e.g. 137 (Polygon) — same as chainIn for same-chain swaps
  tokenOut: string; // token address

  // Amounts (all in wei as strings — BigInt-safe)
  amount: string; // exact input amount in wei
  minAmountOut: string; // minimum acceptable output in wei (slippage protection)

  // Timing
  deadline: number; // unix timestamp (seconds) — intent expires after this

  // Who receives the output tokens
  recipient: string; // wallet address — usually same as signer

  // Constraints
  constraints: IntentConstraints;

  // DLN-ready flag (Phase 2 / M3)
  // true = user prefers instant settlement via DLN/across even if slightly worse rate
  // false = use best route regardless of settlement speed
  preferInstantSettlement: boolean;

  // Anti-replay: random 32-byte hex string
  // Prevents the same signed intent from being submitted twice
  nonce: string;

  // Links this intent back to the RDS-ranked route that was shown to the user
  routeId: string;
};

export type IntentConstraints = {
  maxSlippage: number; // e.g. 0.005 (0.5%) — revert if actual slippage > this
  maxGasFeeWei?: string; // optional gas cap in wei
  allowedProtocols?: string[]; // if set, only these bridges/DEXs are allowed
};

export type SignedIntent = {
  intent: SwapIntent;
  signature: `0x${string}`; // 65-byte ECDSA signature from wallet
  signerAddress: string; // the wallet address that signed (verified on backend)
  chainId: number; // chain where the intent was signed (domain binding)
  signedAt: number; // unix ms timestamp
};

export type PermitData = {
  method: 'permit';
  tokenAddress: string;
  owner: string; // user wallet
  spender: string; // LI.FI contract address
  value: string; // exact amount to approve (wei)
  deadline: number; // unix timestamp — permit expires
  nonce: number; // from the token contract's nonces(owner)
  signature: `0x${string}`;
};

export type ExactApprovalData = {
  method: 'exact';
  tokenAddress: string;
  spender: string;
  amount: string; // wei
};

export type ApprovalData = PermitData | ExactApprovalData | { method: 'none' };

export type SwapIntentInput = Omit<
  SwapIntent,
  'nonce' | 'intentVersion' | 'recipient'
> & {
  recipient?: string;
};
