import {
    TatumSDK,
    Network,
    Ethereum,
    EVM_BASED_NETWORKS,
} from '@tatumio/tatum';
import {
    ActionContext,
    createAction,
    createPiece,
    PieceAuth,
    PieceAuthProperty,
    Property,
} from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';

export const TatumAuth = PieceAuth.None();

const createNFT = createAction({
    displayName: 'Create NFT Token',
    name: 'create_nft',
    description: 'Create NFT Token',
    props: {
        name: Property.ShortText({
            displayName: 'Token Name',
            required: true,
        }),
        symbol: Property.ShortText({
            displayName: 'Token Symbol',
            required: true,
        }),
        owner: Property.ShortText({
            displayName: 'Owner Address',
            required: true,
        }),
        network: Property.StaticDropdown({
            displayName: 'Network',
            required: true,
            options: {
                disabled: false,
                placeholder: 'Select a network',
                options: EVM_BASED_NETWORKS.map((network) => ({
                    label: network,
                    value: network,
                })),
            },
        }),
    },
    async run({ propsValue: { name, symbol, owner, network } }) {
        httpClient.sendRequest<{}>({
            url: `https://api.tatum.io/v4/contract/deploy`,
            method: HttpMethod.POST,
            body: {
                contractType: 'nft',
                chain: network,
                name,
                symbol,
                owner,
            },
        });
        // const tatumSdk = await TatumSDK.init<Ethereum>({
        //     apiKey: {
        //         v1: 't-64f0a52e1c87f9001c1ade3b-b765ce3371d14cfba6d66bb0',
        //         v2: 't-64f0a52e1c87f9001c1ade3b-b765ce3371d14cfba6d66bb0',
        //     },
        //     network,
        // });
        // return tatumSdk.nft.createNftCollection({
        //     name,
        //     symbol,
        //     owner,
        // });
    },
});

export const TatumMintNFT = createAction({
    name: 'tatum-mint-nft',
    displayName: 'Mint NFT',
    description: 'Mint NFT',
    props: {
        network: Property.StaticDropdown({
            displayName: 'Network',
            required: true,
            options: {
                disabled: false,
                placeholder: 'Select a network',
                options: EVM_BASED_NETWORKS.map((network) => ({
                    label: network,
                    value: network,
                })),
            },
        }),
    },
    async run({ propsValue: { network } }) {
        const tatumSdk = await TatumSDK.init<Ethereum>({
            apiKey: {
                v1: 't-64f0a52e1c87f9001c1ade3b-b765ce3371d14cfba6d66bb0',
                v2: 't-64f0a52e1c87f9001c1ade3b-b765ce3371d14cfba6d66bb0',
            },
            network,
        });

        throw new Error('Function not implemented.');
    },
});

export const tatum = createPiece({
    displayName: 'Tatum',
    auth: TatumAuth,
    minimumSupportedRelease: '0.7.1',
    logoUrl:
        'https://raw.githubusercontent.com/tookey-io/icons/main/piece-tatum.png',
    authors: ['Aler Denisov'],
    actions: [createNFT],
    triggers: [],
});
