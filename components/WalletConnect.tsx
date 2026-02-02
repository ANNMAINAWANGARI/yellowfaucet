'use client';
import { Wallet, Loader2, LogOut, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface WalletConnectProps {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  hasMetaMask: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({
  address,
  isConnected,
  isConnecting,
  hasMetaMask,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!hasMetaMask) {
    return (
      <Button
        variant="outline"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Install MetaMask
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-50" />
          </div>
          <span className="font-mono text-sm text-foreground">
            {truncateAddress(address)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          className="text-muted-foreground hover:text-destructive"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        onClick={onConnect}
        disabled={isConnecting}
        className="gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
