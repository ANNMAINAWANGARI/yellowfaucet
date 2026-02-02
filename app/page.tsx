'use client';
import Header from "@/components/Header";
import { WalletConnect } from "@/components/WalletConnect";
import { useWallet } from '@/hooks/useWallet';

export default function Home() {
  const wallet = useWallet();
  return (
    <main className="min-h-screen flex flex-col grid-bg">
      <Header/>
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* left */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Powered by State Channels</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                The <span className="gradient-text">Unlimited</span> Test Token Faucet
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                No rate limits. No social verification. No waiting. Get instant test tokens 
                through Yellow Network's ERC-7824 state channels.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <WalletConnect
                    address={wallet.address}
                    isConnected={wallet.isConnected}
                    isConnecting={wallet.isConnecting}
                    hasMetaMask={wallet.hasMetaMask}
                    error={wallet.error}
                    onConnect={wallet.connect}
                    onDisconnect={wallet.disconnect}
                />
              </div>
            </div>
            {/* right */}
          </div>
        </div>
      </section>
    </main>
  );
}
