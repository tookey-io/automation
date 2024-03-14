import {
    AgentResolver,
    BjjProvider, CredentialStatusResolverRegistry,
    CredentialStatusType,
    CredentialStorage,
    CredentialWallet,
    defaultEthConnectionConfig,
    EthStateStorage,
    FSCircuitStorage,
    hexToBytes,
    Identity,
    IdentityStorage,
    IdentityWallet,
    IssuerResolver,
    KMS,
    KmsKeyType,
    OnChainResolver,
    Profile,
    RHSResolver,
    W3CCredential
} from '@0xpolygonid/js-sdk';
import { ActionContext } from '@activepieces/pieces-framework';
import { PublicKey } from '@iden3/js-crypto';
import { Blockchain, DID, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { KeyValueMerkleTreeStorage } from './storage/merke-tree-store';
import { KeyValuePrivateKeyStore } from './KeyValuePrivateKeyStore';
import { KeyValueDataSource } from './KeyValueDataSource';
import { PolygonIdAuth } from '..';
import path from 'path';

export const initializeContext = async (context: ActionContext<typeof PolygonIdAuth, any>) => {
    const credentialStore = new KeyValueDataSource<W3CCredential>('CREDS', context);
    const credential = new CredentialStorage(credentialStore);
    const identityStore = new KeyValueDataSource<Identity>('IDENTITIES', context);
    const profileStore = new KeyValueDataSource<Profile>('PROFILES', context);
    const identity = new IdentityStorage(identityStore, profileStore);
    const mt = new KeyValueMerkleTreeStorage(context, 40);
    const states = new EthStateStorage({
        ...defaultEthConnectionConfig,
        url: 'https://rpc-mumbai.maticvigil.com',
        contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
        chainId: 80001,
    });

    const keyStore = new KeyValuePrivateKeyStore('KEYS', context);

    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const statusRegistry = new CredentialStatusResolverRegistry();
    statusRegistry.register(CredentialStatusType.SparseMerkleTreeProof, new IssuerResolver());
    statusRegistry.register(CredentialStatusType.Iden3ReverseSparseMerkleTreeProof, new RHSResolver(states));
    statusRegistry.register(
        CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        new OnChainResolver([
            {
                ...defaultEthConnectionConfig,
                url: 'https://rpc-mumbai.maticvigil.com',
                contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
                chainId: 80001,
            },
        ])
    );
    statusRegistry.register(CredentialStatusType.Iden3commRevocationStatusV1, new AgentResolver());

    const store = {
        credential,
        identity,
        mt,
        states,
    };

    const credWallet = new CredentialWallet(store, statusRegistry);
    const wallet = new IdentityWallet(kms, store, credWallet);
    const seed = context.auth.seed.startsWith('0x') ? context.auth.seed.slice(2) : context.auth.seed;
    const seedPhrase: Uint8Array = hexToBytes(seed);

    const keyId = await bjjProvider.newPrivateKeyFromSeed(seedPhrase);
    const pubKeyHex = await kms.publicKey(keyId);
    const pubKey = PublicKey.newFromHex(pubKeyHex);

    let myAuth = await credential
        .listCredentials()
        .then((credentials) => credentials.find(
            (c) => c.credentialSubject['type'] === 'AuthBJJCredential' &&
                c.credentialSubject['x'] === pubKey.p[0].toString() &&
                c.credentialSubject['y'] === pubKey.p[1].toString()
        )
        );
    let myDid = myAuth?.issuer ? DID.parse(myAuth.issuer) : undefined;

    if (!myAuth) {
        const { did, credential } = await wallet.createIdentity({
            method: DidMethod.Iden3,
            blockchain: Blockchain.Polygon,
            networkId: NetworkId.Mumbai,
            seed: seedPhrase,
            revocationOpts: {
                type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
                id: 'https://rhs-staging.polygonid.me',
            },
        });

        myDid = did;
        myAuth = credential;
    }

    if (!myDid || !myAuth) {
        throw new Error('Unable to create identity');
    }

    return {
        credentialStore,
        credential,
        identityStore,
        profileStore,
        identity,
        mt,
        states,
        keyStore,
        me: {
            did: myDid,
            auth: myAuth,
        },
        wallet,
        credWallet,
        pubKeyHex,
    };
};
