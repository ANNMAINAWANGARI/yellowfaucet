'use client';

import { Client } from "yellow-ts";
import { createWalletClient, custom, Hex, http, WalletClient } from "viem";
import { createAppSessionMessage, createAuthRequestMessage, createAuthVerifyMessage, createCloseAppSessionMessage, createECDSAMessageSigner, createEIP712AuthMessageSigner, createSubmitAppStateMessage, RPCAppDefinition, RPCAppSessionAllocation, RPCData, RPCMethod, RPCProtocolVersion, RPCResponse } from "@erc7824/nitrolite";
import { base,sepolia } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";


function generateSessionKey() {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return { privateKey, address: account.address };
}

async function authenticateWallet(client: Client, walletClient: any) {
    console.log(`🔑 Authenticating faucet...`);

    const sessionKey = generateSessionKey();
    const sessionExpireTimestamp = String(Math.floor(Date.now() / 1000) + 3600);

    const authMessage = await createAuthRequestMessage({
        address: walletClient.account?.address as `0x${string}`,
        session_key: sessionKey.address,
        application: 'Yellow Faucet',
        allowances: [{
            asset: 'usdc',
            amount: '10',
        }],
        expires_at: BigInt(sessionExpireTimestamp),
        scope: 'faucet.app',
    });

    let authComplete = false;

    async function handleAuthChallenge(message: any) {
        const authParams = {
            scope: 'faucet.app',
            application: walletClient.account?.address as `0x${string}`,
            participant: sessionKey.address,
            expire: sessionExpireTimestamp,
            allowances: [{
                asset: 'usdc',
                amount: '10',
            }],
            session_key: sessionKey.address,
            expires_at: BigInt(sessionExpireTimestamp),
        };

        const eip712Signer = createEIP712AuthMessageSigner(
            walletClient, 
            authParams, 
            { name: 'Yellow Faucet' }
        );

        const authVerifyMessage = await createAuthVerifyMessage(eip712Signer, message);
        await client.sendMessage(authVerifyMessage);
        authComplete = true;
    }

    client.listen(async (message: RPCResponse) => {
        if (message.method === RPCMethod.AuthChallenge) {
            await handleAuthChallenge(message);
        }
    });

    await client.sendMessage(authMessage);

    // Wait for auth to complete
    while (!authComplete) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Authentication complete');
    return sessionKey;
}

export async function YellowFaucet(address:Hex){
    const yellow = new Client({
        url: 'wss://clearnet-sandbox.yellow.com/ws',
    })

    await yellow.connect();
    const faucetClient = createWalletClient({
        account:'0xCE47528A702F24cC819D7aDb282bbB13a39801eb',
        chain:sepolia,
        transport: custom(window.ethereum!),
    });
    const walletClient = createWalletClient({
        account:address,
        chain:sepolia, 
        transport: custom(window.ethereum!),
    })


    const sessionKeyFaucet = await authenticateWallet(yellow, faucetClient as WalletClient);
    const messageSignerFaucet = createECDSAMessageSigner(sessionKeyFaucet.privateKey);

    const sessionKeyWallet = await authenticateWallet(yellow, walletClient as WalletClient);
    const messageSignerWallet = createECDSAMessageSigner(sessionKeyWallet.privateKey);


    const appDefinition: RPCAppDefinition = {
            protocol: RPCProtocolVersion.NitroRPC_0_4,
            participants: ['0xCE47528A702F24cC819D7aDb282bbB13a39801eb',address],
            weights: [100, 0],
            quorum: 100,
            challenge: 0,
            nonce: Date.now(),
            application: 'Yellow Faucet',
    };

    const initialAllocations: RPCAppSessionAllocation[] = [
            { 
                participant: '0xCE47528A702F24cC819D7aDb282bbB13a39801eb', 
                asset: 'usdc', 
                amount:'10' 
            },
            { 
                participant:address, 
                asset: 'usdc', 
                amount: '0' 
            }
    ];

    const sessionMessage = await createAppSessionMessage(
            messageSignerFaucet,
            { definition: appDefinition, allocations: initialAllocations }
    );

     const sessionResponse = await yellow.sendMessage(sessionMessage);

    const finalAllocations = [
        {participant: address, asset: 'usdc', amount: '5.00' },
        {participant: '0xCE47528A702F24cC819D7aDb282bbB13a39801eb', asset: 'usdc', amount: '5.00' }
    ] as RPCAppSessionAllocation[];

    const submitAppStateMessage = await createSubmitAppStateMessage(
      messageSignerFaucet,
      { app_session_id: sessionResponse.params.appSessionId, allocations: finalAllocations }
    );

    const submitAppStateMessageJson = JSON.parse(submitAppStateMessage);

    const closeSessionMessage = await createCloseAppSessionMessage(
        messageSignerFaucet,
        { app_session_id: sessionResponse.params.appSessionId, allocations: finalAllocations }
    );



    // Parse the message to add additional signatures
    const closeSessionMessageJson = JSON.parse(closeSessionMessage);

    const signedCloseSessionMessageSignature2 = await messageSignerFaucet(
        closeSessionMessageJson.req as RPCData
    );

    closeSessionMessageJson.sig.push(signedCloseSessionMessageSignature2);

    const closeSessionResponse = await yellow.sendMessage(
        JSON.stringify(closeSessionMessageJson)
    );

    console.log('🎉 Close session response:', closeSessionResponse);

    yellow.listen(async (message: RPCResponse) => {
        console.log('📨 Received message:', message);
    });
}