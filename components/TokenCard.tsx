'use client';
import { Token } from '@/types/faucet';
import { cn } from '@/lib/utils';

interface TokenCardProps {
  token: Token;
  isSelected: boolean;
  onSelect: (token: Token) => void;
  disabled?: boolean;
}

export function TokenCard({ token, isSelected, onSelect, disabled }: TokenCardProps) {
  return (
    <button
      onClick={() => onSelect(token)}
      disabled={disabled}
      className={cn(
        'token-card glass-card rounded-2xl p-5 text-left w-full',
        'border-2 transition-all duration-300 ',
        isSelected
          ? 'border-primary neon-glow-sm'
          : 'border-primary/50',
        disabled && 'opacity-90 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${token.color}20` }}
        >
          {token.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{token.symbol}</h3>
            <span className="text-sm font-mono text-primary font-bold">
              +{token.faucetAmount}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{token.name}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{token.description}</p>
    </button>
  );
}
