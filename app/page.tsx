'use client';
import Header from "@/components/Header";
import { TokenSelector } from "@/components/TokenSelector";
import { WalletConnect } from "@/components/WalletConnect";
import { SUPPORTED_TOKENS } from "@/config/tokens";
import { useWallet } from '@/hooks/useWallet';
import { Token } from "@/types/faucet";
import { useState } from "react";

export default function Home() {
  const wallet = useWallet();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleRequest = async () => {}
  return (
    <main className="min-h-screen flex flex-col grid-bg">
      <Header/>
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            {/* left */}
            <div className=" w-full flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Powered by State Channels</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                The <span className="gradient-text">Unlimited</span> Test Token Faucet
              </h1>
              <p className="text-lg tracking-wide text-gray-400 mb-8 max-w-xl">
                No rate limits. No social verification. No waiting. Get instant test tokens 
                through Yellow Network's ERC-7824 state channels.
              </p>
              
            </div>
          </div>
          <div className="py-12 bg-muted/20">
           <div className="container mx-auto px-4">
            <TokenSelector
              tokens={SUPPORTED_TOKENS}
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
              amount={amount}
              onAmountChange={setAmount}
              onRequest={handleRequest}
              isProcessing={isProcessing}
              isChannelConnected={true}
              isWalletConnected={wallet.isConnected}
            />
           </div>
          </div>
        </div>
      </section>
    </main>
  );
}
