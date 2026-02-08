import { Hex } from "viem";

export interface WalletState {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  error: string | null;
}


 export type MessageSigner = (message: string) => Promise<string>;





export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  decimals: number;
  faucetAmount: string;
  description: string;
}

export interface FaucetConfig {
  faucetAddress: string;
  clearNodeUrl: string;
  supportedTokens: Token[];
}