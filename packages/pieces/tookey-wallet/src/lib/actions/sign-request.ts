import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend } from '../backend';
import { encodeMessageSignature } from '@tookey-io/libtss-ethereum';
import * as ethers from 'ethers';

export const signRequest = createAction({
    name: 'sign-request',
    displayName: 'Sign Transaction Request',
    description: 'Send request on signing transaction',
    sampleData: {},
    props: {
        backendUrl: Property.ShortText({
            displayName: 'Backend URL',
            description: 'Tookey Backend URL (self-hosted url or keep default)',
            defaultValue: 'https://backend.apps-production.tookey.cloud',
            required: true,
        }),
        wallet: Property.Dropdown<string, true>({
            displayName: 'Wallet',
            description: 'Wallet to sign hash',
            required: true,
            defaultValue: '0x',
            refreshers: ['apiKey', 'backendUrl'],
            async options({ auth, backendUrl }) {
                if (typeof backendUrl !== 'string')
                    return {
                        disabled: true,
                        options: [
                            { label: 'Provide backend url', value: 'error' },
                        ],
                    };
                if (typeof auth !== 'string')
                    return {
                        disabled: true,
                        options: [{ label: 'Provide apiKey', value: 'error' }],
                    };

                try {
                    const backend = new Backend(backendUrl, auth);

                    return {
                        disabled: false,
                        options: await backend.getKeys().then((keys) =>
                            keys.items.map((key) => ({
                                value: key.publicKey,
                                label: `${key.name} ${key.publicKey} ${key.id}`,
                            }))
                        ),
                    };
                } catch (e: any) {
                    return {
                        disabled: true,
                        options: [{ label: e.toString(), value: 'error' }],
                    };
                }
            },
        }),
        signer: Property.Dropdown<string, true>({
            displayName: 'Signer',
            description: 'Signer instance',
            required: true,
            defaultValue: '...',
            refreshers: ['backendUrl', 'wallet'],
            async options({ auth, backendUrl, wallet }) {
                if (typeof backendUrl !== 'string')
                    return {
                        disabled: true,
                        options: [
                            { label: 'Provide backend url', value: 'error' },
                        ],
                    };
                if (typeof auth !== 'string')
                    return {
                        disabled: true,
                        options: [{ label: 'Provide apiKey', value: 'error' }],
                    };
                if (typeof wallet !== 'string')
                    return {
                        disabled: true,
                        options: [{ label: 'Select a wallet', value: 'error' }],
                    };

                try {
                    const backend = new Backend(backendUrl, auth);

                    return {
                        disabled: false,
                        options: await backend
                            .getDevicesForKey(wallet)
                            .then((devices) => {
                                console.log('devices of ', wallet, devices);
                                return devices.map((d) => ({
                                    label: `${d.name} ${d.description}`,
                                    value: d.token,
                                }));
                            }),
                    };
                } catch (e: any) {
                    return {
                        disabled: true,
                        options: [{ label: e.toString(), value: 'error' }],
                    };
                }
            },
        }),
        tx: Property.Object({
            displayName: 'Transaction',
            description: 'Transaction to sign',
            required: true,
        }),
    },
    async run({ auth, propsValue: { backendUrl, tx, wallet, signer } }) {
        const backend = new Backend(backendUrl, auth as string);
        const txInstance = ethers.Transaction.from({
            ...tx,
            from: undefined
        });
        const hash = txInstance.unsignedHash;
        const signatureResponse = await backend.initializeSign(
            wallet,
            hash,
            signer,
            {
                kind: 'ethereum-tx',
                ...tx,
            }
        );

        const signature = encodeMessageSignature(
            hash,
            Number.parseInt((tx['chainId'] as string).substring(2), 16),
            JSON.stringify(signatureResponse)
        ).result!;
        return ethers.Transaction.from({
            ...tx,
            signature,
        }).serialized;
    },
});
