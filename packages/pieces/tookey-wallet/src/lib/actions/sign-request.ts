import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend } from '../backend';
import { encodeMessageSignature } from '@tookey-io/libtss-ethereum';
import * as ethers from 'ethers';
import { TookeyAuth } from '../../index';

export const signRequest = createAction({
    auth: TookeyAuth,
    name: 'sign-request',
    displayName: 'Sign Transaction Request',
    description: 'Send request on signing transaction',
    props: {
        wallet: Property.Dropdown<string, true>({
            displayName: 'Wallet',
            description: 'Wallet to sign hash',
            required: true,
            refreshers: [],
            async options({ auth }) {
                const authAny = auth as any;
                if (
                    typeof authAny !== 'object' ||
                    !('backendUrl' in authAny) ||
                    !('token' in authAny) ||
                    !(typeof authAny.backendUrl === 'string') ||
                    !(typeof authAny.token === 'string')
                )
                    return {
                        disabled: true,
                        options: [{ label: 'Provide apiKey', value: 'error' }],
                    };

                try {
                    const backend = new Backend(
                        authAny.backendUrl,
                        authAny.token
                    );

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
            refreshers: ['wallet'],
            async options({ auth, wallet }) {
                const authAny = auth as any;
                if (
                    typeof authAny !== 'object' ||
                    !('backendUrl' in authAny) ||
                    !('token' in authAny) ||
                    !(typeof authAny.backendUrl === 'string') ||
                    !(typeof authAny.token === 'string')
                )
                    return {
                        disabled: true,
                        options: [{ label: 'Provide apiKey', value: 'error' }],
                    };

                if (typeof wallet !== 'string' || wallet === '0x')
                    return {
                        disabled: true,
                        options: [{ label: 'Select a wallet', value: 'error' }],
                    }

                try {
                    const backend = new Backend(authAny.backendUrl, authAny.token);

                    console.log(wallet)

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
    async run({ auth, propsValue: { tx, wallet, signer } }) {
        const backend = new Backend(auth.backendUrl, auth.token);
        const txInstance = ethers.Transaction.from({
            ...tx,
            from: undefined,
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
