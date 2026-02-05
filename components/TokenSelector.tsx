'use client';

import { useState } from 'react';
import { Token } from '@/types/faucet';
import { TokenCard } from './TokenCard';
import { Button } from '@/components/ui/button';
import { Loader2, Droplets, Plus, Minus } from 'lucide-react';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onRequest: () => void;
  isProcessing: boolean;
  isChannelConnected: boolean;
  isWalletConnected: boolean;
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelectToken,
  amount,
  onAmountChange,
  onRequest,
  isProcessing,
  isChannelConnected,
  isWalletConnected,
}: TokenSelectorProps) {
  const [customAmount, setCustomAmount] = useState(false);

  const adjustAmount = (delta: number) => {
    const current = parseFloat(amount) || 0;
    const newAmount = Math.max(0, current + delta);
    onAmountChange(newAmount.toString());
  };

  const presetMultipliers = [1, 2, 5, 10];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          Select Token
        </h2>
        <span className="text-sm text-gray-400 tracking-wide">
          {tokens.length} tokens available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <TokenCard
            key={token.id}
            token={token}
            isSelected={selectedToken?.id === token.id}
            onSelect={onSelectToken}
            disabled={!isChannelConnected}
          />
        ))}
      </div>

      {selectedToken && (
        <div className="glass-card rounded-2xl p-6 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Claim Amount</h3>
            <button
              onClick={() => setCustomAmount(!customAmount)}
              className="text-sm text-primary hover:underline"
            >
              {customAmount ? 'Use presets' : 'Custom amount'}
            </button>
          </div>

          {customAmount ? (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustAmount(-parseFloat(selectedToken.faucetAmount))}
                disabled={parseFloat(amount) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold text-foreground border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  min="0"
                  step={selectedToken.faucetAmount}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustAmount(parseFloat(selectedToken.faucetAmount))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {presetMultipliers.map((multiplier) => {
                const presetAmount = (
                  parseFloat(selectedToken.faucetAmount) * multiplier
                ).toString();
                return (
                  <button
                    key={multiplier}
                    onClick={() => onAmountChange(presetAmount)}
                    className={`py-3 px-4 rounded-xl text-center font-mono font-bold transition-all ${
                      amount === presetAmount
                        ? 'bg-primary text-primary-foreground neon-glow-sm'
                        : 'bg-muted text-foreground hover:bg-muted/70 border border-border'
                    }`}
                  >
                    {presetAmount}
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Claiming <span className="font-mono font-bold text-primary">{amount}</span>{' '}
              <span className="font-semibold">{selectedToken.symbol}</span>
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={onRequest}
              disabled={!isChannelConnected || !isWalletConnected || isProcessing || parseFloat(amount) <= 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Droplets className="h-5 w-5" />
                  Claim {selectedToken.symbol}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {!isWalletConnected && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Connect your wallet to start claiming test tokens
          </p>
        </div>
      )}

      {isWalletConnected && !isChannelConnected && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Open a state channel to claim tokens instantly
          </p>
        </div>
      )}
    </div>
  );
}
