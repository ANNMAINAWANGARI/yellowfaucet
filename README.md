# Yellow Faucet

A decentralized faucet implementation using Yellow Network's state channels to distribute test USDC tokens on testnet.

## Overview

This project implements a peer-to-peer faucet that uses Yellow Network's Nitro protocol to distribute USDC tokens efficiently through off-chain state channels. Instead of executing costly on-chain transactions for each faucet request, it leverages state channels for fast, gasless transfers.

## How It Works

### State Channel Flow

1. **Authentication**: Both the faucet wallet and user wallet authenticate with Yellow Network
2. **Channel Opening**: A payment channel (app session) is created between faucet and user
3. **Off-Chain Transfer**: Funds are allocated off-chain (5 USDC to user, 5 USDC back to faucet)
4. **Channel Closure**: The final state is settled, triggering on-chain settlement

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Faucet    │◄───────►│    Yellow    │◄───────►│    User     │
│   Wallet    │         │   Network    │         │   Wallet    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                                                 │
       │          State Channel (Off-Chain)              │
       ├─────────────────────────────────────────────────┤
       │   Initial: [Faucet: 10 USDC, User: 0 USDC]     │
       │   Final:   [Faucet: 5 USDC,  User: 5 USDC]     │
       └─────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js v16+
- MetaMask or compatible Web3 wallet

## Dependencies

```json
{
  "yellow-ts": "^latest",
  "viem": "^latest",
  "@erc7824/nitrolite": "^latest"
}
```

## Installation

```bash
npm install yellow-ts viem @erc7824/nitrolite
```

## Usage

### Basic Implementation

```typescript
import { YellowFaucet } from './YellowFaucet';

// Request 5 USDC from the faucet
const userAddress = '0x...'; // User's wallet address
await YellowFaucet(userAddress);
```

### Integration Example

```typescript
'use client';

import { YellowFaucet } from './YellowFaucet';
import { useAccount } from 'wagmi';

export function FaucetButton() {
  const { address } = useAccount();

  const handleClaim = async () => {
    if (!address) return;
    
    try {
      await YellowFaucet(address);
      console.log('✅ Successfully claimed 5 USDC!');
    } catch (error) {
      console.error('❌ Faucet claim failed:', error);
    }
  };

  return (
    <button onClick={handleClaim}>
      Claim 5 USDC
    </button>
  );
}
```

## Configuration

### Network Settings

- **Network**: Yellow Clearnet Sandbox
- **WebSocket URL**: `wss://clearnet-sandbox.yellow.com/ws`
- **Chain**: Any Testnet
- **Asset**: USDC

### Faucet Configuration

- **Faucet Address**: `0xCE47528A702F24cC819D7aDb282bbB13a39801eb`
- **Distribution Amount**: 5 USDC per request
- **Session Duration**: 1 hour (3600 seconds)
- **Max Allowance**: 10 USDC per session

## Key Functions

### `generateSessionKey()`
Generates ephemeral cryptographic keys for the session.

**Returns:**
- `privateKey`: Temporary private key
- `address`: Corresponding Ethereum address

### `authenticateWallet(client, walletClient)`
Authenticates a wallet with Yellow Network and creates an authorized session.

**Parameters:**
- `client`: Yellow Network client instance
- `walletClient`: Viem wallet client

**Returns:**
- Session key object with private key and address

### `YellowFaucet(address)`
Main function that executes the faucet flow.

**Parameters:**
- `address`: User's Ethereum address (must be a valid hex address)

**Process:**
1. Connects to Yellow Network
2. Authenticates faucet and user wallets
3. Creates payment channel with initial allocations
4. Updates state to transfer 5 USDC to user
5. Closes channel and settles final state

## Technical Details

### Protocol Used
- **ERC-7824 Nitro Protocol** (v0.4)
- State channel framework for off-chain transactions

### Signature Types
- **EIP-712**: Structured data signing for authentication
- **ECDSA**: Message signing for session operations

### State Channel Parameters

```typescript
{
  protocol: RPCProtocolVersion.NitroRPC_0_4,
  participants: [faucetAddress, userAddress],
  weights: [100, 0],  // Faucet has full control initially
  quorum: 100,         // 100% agreement needed
  challenge: 0,        // No challenge period
  nonce: timestamp,    // Unique session identifier
}
```

## Security Considerations

### Current Implementation
⚠️ **This is a sandbox/testnet implementation**

### Known Limitations

1. **Hardcoded Faucet Key**: The faucet private key should be stored in environment variables
2. **No Rate Limiting**: Users could potentially request multiple times
3. **No Error Handling**: Network failures may cause silent errors
4. **Single Signature**: User wallet doesn't co-sign channel closure
5. **Browser Dependency**: Requires `window.ethereum` (MetaMask)

### Production Recommendations

```typescript
// Use environment variables
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS;
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;

// Add rate limiting
const requestCache = new Map();
function canRequestFaucet(address: string): boolean {
  const lastRequest = requestCache.get(address);
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours
  return !lastRequest || Date.now() - lastRequest > cooldown;
}

// Add error handling
try {
  await YellowFaucet(address);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    throw new Error('Faucet is empty');
  }
  throw error;
}
```

## Troubleshooting

### Common Issues

**"Authentication failed"**
- Ensure wallet is connected to Sepolia testnet
- Check that MetaMask is unlocked
- Verify session hasn't expired

**"Insufficient allowance"**
- Faucet session allows max 10 USDC
- Wait for current session to expire (1 hour)

**"Connection timeout"**
- Yellow Network sandbox may be down
- Check WebSocket connection
- Verify network connectivity

### Debug Mode

```typescript
// Enable verbose logging
yellow.listen((message) => {
  console.log('📨 Message received:', message);
});
```

## API Reference

### Yellow Client

```typescript
const yellow = new Client({
  url: 'wss://clearnet-sandbox.yellow.com/ws',
});

await yellow.connect();
await yellow.sendMessage(message);
yellow.listen(callback);
```

### Message Types

- `AuthRequest`: Initial authentication request
- `AuthChallenge`: Challenge from Yellow Network
- `AuthVerify`: Challenge response with signature
- `AppSession`: Create payment channel
- `SubmitAppState`: Update channel state
- `CloseAppSession`: Finalize and settle channel

## Contributing

Contributions are welcome! Please ensure:

1. Code follows TypeScript best practices
2. Add error handling for production use
3. Include tests for new features
4. Update documentation

## License

MIT License - see LICENSE file for details

## Resources

- [Yellow Network Documentation](https://docs.yellow.com)
- [Nitro Protocol Specification](https://erc7824.org)
- [Viem Documentation](https://viem.sh)
- [State Channels Explained](https://ethereum.org/en/developers/docs/scaling/state-channels/)

## Support

- GitHub Issues: [Report bugs or request features]
- Discord: [Yellow Network Community]
- Email: support@yellow.com

## Changelog

### v1.0.0 (Current)
- Initial implementation
- Basic faucet functionality
- Sepolia testnet support
- 5 USDC distribution per request

---

**⚠️ Testnet Only**: This faucet is for testing purposes on testnet. Do not use with real funds on mainnet.