import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import type {
  SignedIntent,
  SwapIntent,
  SwapIntentInput,
} from '@/lib/intent.types';

export const EIP712_DOMAIN_BASE = {
  name: 'Abrium',
  version: '1',
} as const;

export const EIP712_INTENT_CONSTRAINTS_TYPES = [
  { name: 'maxSlippage', type: 'uint256' },
  { name: 'maxGasFeeWei', type: 'string' },
  { name: 'allowedProtocols', type: 'string' },
] as const;

export const EIP712_SWAP_INTENT_TYPES = [
  { name: 'intentVersion', type: 'string' },
  { name: 'intentType', type: 'string' },
  { name: 'chainIn', type: 'uint256' },
  { name: 'tokenIn', type: 'string' },
  { name: 'chainOut', type: 'uint256' },
  { name: 'tokenOut', type: 'string' },
  { name: 'amount', type: 'uint256' },
  { name: 'minAmountOut', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'recipient', type: 'address' },
  { name: 'maxSlippage', type: 'uint256' },
  { name: 'preferInstantSettlement', type: 'bool' },
  { name: 'nonce', type: 'bytes32' },
  { name: 'routeId', type: 'string' },
] as const;

function generateNonce(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`;
}

function slippageToBps(slippage: number): bigint {
  return BigInt(Math.round(slippage * 10_000));
}

export function useSignIntent() {
  const { primaryWallet } = useDynamicContext();

  return async (input: SwapIntentInput): Promise<SignedIntent> => {
    if (!primaryWallet) throw new Error('Wallet not connected');
    if (!isEthereumWallet(primaryWallet))
      throw new Error('EVM wallet required for signing');

    const walletClient = await primaryWallet.getWalletClient();
    const address = primaryWallet.address as `0x${string}`;
    const chainId = walletClient.chain?.id ?? 1; // fallback to mainnet if chain not reported

    const nonce = generateNonce();

    const intent: SwapIntent = {
      intentVersion: '1.0.0',
      intentType: input.intentType,
      chainIn: input.chainIn,
      tokenIn: input.tokenIn,
      chainOut: input.chainOut,
      tokenOut: input.tokenOut,
      amount: input.amount,
      minAmountOut: input.minAmountOut,
      deadline: input.deadline,
      recipient: input.recipient ?? address,
      constraints: input.constraints,
      preferInstantSettlement: input.preferInstantSettlement,
      nonce,
      routeId: input.routeId,
    };

    const signature = await walletClient.signTypedData({
      domain: {
        ...EIP712_DOMAIN_BASE,
        chainId,
      },
      types: {
        SwapIntent: EIP712_SWAP_INTENT_TYPES,
      },
      primaryType: 'SwapIntent',
      message: {
        intentVersion: intent.intentVersion,
        intentType: intent.intentType,
        chainIn: BigInt(intent.chainIn),
        tokenIn: intent.tokenIn,
        chainOut: BigInt(intent.chainOut),
        tokenOut: intent.tokenOut,
        amount: BigInt(intent.amount),
        minAmountOut: BigInt(intent.minAmountOut),
        deadline: BigInt(intent.deadline),
        recipient: intent.recipient as `0x${string}`,
        maxSlippage: slippageToBps(intent.constraints.maxSlippage),
        preferInstantSettlement: intent.preferInstantSettlement,
        nonce: intent.nonce as `0x${string}`,
        routeId: intent.routeId,
      },
    });

    return {
      intent,
      signature,
      signerAddress: address,
      chainId,
      signedAt: Date.now(),
    };
  };
}
