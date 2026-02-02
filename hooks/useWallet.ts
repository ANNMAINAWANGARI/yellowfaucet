'use client';

import { useState, useCallback, useEffect } from 'react';
import { Hex } from 'viem';
import { WalletState, MessageSigner } from '@/types/faucet';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export type SignTypedDataFn = (
  domain: object, 
  types: object, 
  primaryType: string, 
  message: object
) => Promise<Hex>;

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    isConnected: false,
    chainId: null,
    error: null,
  });

  const [messageSigner, setMessageSigner] = useState<MessageSigner | null>(null);
  const [signTypedData, setSignTypedData] = useState<SignTypedDataFn | null>(null);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const chainId = parseInt(chainIdHex, 16);

      if (accounts.length > 0) {
        const address = accounts[0];
        setState({
          address,
          isConnecting: false,
          isConnected: true,
          chainId,
          error: null,
        });

        const signer: MessageSigner = async (message: string) => {
          return await window.ethereum!.request({
            method: 'personal_sign',
            params: [message, address],
          }) as string;
        };
        setMessageSigner(() => signer);

        // Create EIP-712 typed data signer
        const typedDataSigner: SignTypedDataFn = async (domain, types, primaryType, message) => {
          // Build the full EIP-712 typed data structure
          const typedData = {
            types: {
              EIP712Domain: [{ name: 'name', type: 'string' }],
              ...types,
            },
            domain,
            primaryType,
            message,
          };

          return await window.ethereum!.request({
            method: 'eth_signTypedData_v4',
            params: [address, JSON.stringify(typedData)],
          }) as Hex;
        };
        setSignTypedData(() => typedDataSigner);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'Please install MetaMask to use this faucet',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;

      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0];

      const signer: MessageSigner = async (message: string) => {
        return await window.ethereum!.request({
          method: 'personal_sign',
          params: [message, address],
        }) as string;
      };

      setMessageSigner(() => signer);

      // Create EIP-712 typed data signer
      const typedDataSigner: SignTypedDataFn = async (domain, types, primaryType, message) => {
        const typedData = {
          types: {
            EIP712Domain: [{ name: 'name', type: 'string' }],
            ...types,
          },
          domain,
          primaryType,
          message,
        };

        return await window.ethereum!.request({
          method: 'eth_signTypedData_v4',
          params: [address, JSON.stringify(typedData)],
        }) as Hex;
      };
      setSignTypedData(() => typedDataSigner);

      setState({
        address,
        isConnecting: false,
        isConnected: true,
        chainId,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnecting: false,
      isConnected: false,
      chainId: null,
      error: null,
    });
    setMessageSigner(null);
    setSignTypedData(null);
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length === 0) {
          disconnect();
        } else {
          setState(prev => ({
            ...prev,
            address: accountsArray[0],
          }));
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        setState(prev => ({
          ...prev,
          chainId: parseInt(chainId as string, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnect]);

  return {
    ...state,
    messageSigner,
    signTypedData,
    connect,
    disconnect,
    hasMetaMask: typeof window !== 'undefined' && !!window.ethereum,
  };
}