
export interface WalletState {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  error: string | null;
}


export type MessageSigner = (message: string) => Promise<string>;