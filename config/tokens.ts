import { Token, FaucetConfig } from '@/types/faucet';

export const SUPPORTED_TOKENS: Token[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: '#627EEA',
    decimals: 18,
    faucetAmount: '0.05',
    description: 'Native ETH for gas fees',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '💵',
    color: '#2775CA',
    decimals: 6,
    faucetAmount: '10',
    description: 'Stablecoin pegged to USD',
  }
  
];

export const FAUCET_CONFIG: FaucetConfig = {
  // Demo faucet address 
  faucetAddress: '0xCE47528A702F24cC819D7aDb282bbB13a39801eb',
  // Using sandbox for testing
  clearNodeUrl: 'wss://clearnet-sandbox.yellow.com/ws',
  supportedTokens: SUPPORTED_TOKENS,
};


