import { Property, createAction } from '@activepieces/pieces-framework';

const swapProperties = {
    from: Property.StaticDropdown({
        displayName: 'From Stable',
        description: 'Select from token',
        required: true,
        options: {
            options: [
                { value: 'polygon_usdc', label: 'Polygon USDC' },
                { value: 'tron_usdt', label: 'Tron USDT' },
                { value: 'ethereum_usdt', label: 'Ethereum USDT' },
            ],
        },
    }),
    to: Property.StaticDropdown({
        displayName: 'To Stable',
        description: 'Select from token',
        required: true,
        options: {
            options: [
                { value: 'polygon_usdc', label: 'Polygon USDC' },
                { value: 'tron_usdt', label: 'Tron USDT' },
                { value: 'ethereum_usdt', label: 'Ethereum USDT' },
            ],
        },
    }),
    amount: Property.Number({
        displayName: 'Amount',
        description: 'Amount to swap',
        required: true,
    }),
    destinationWallet: Property.ShortText({
        displayName: 'Destination Wallet',
        description: 'Destination wallet address',
        required: false,
    })
}

export const SwapStablesExactIn = createAction({
    requireAuth: false,
    name: 'swap_stables_exact_in',
    displayName: 'Swap Exact Amount',
    description: 'Cross-chain swap exact amount of stables',
    props: {
        ...swapProperties
    },
    async run(context) {
        throw new Error('Not implemented');
    },
});


export const SwapStablesExactOut = createAction({
    requireAuth: false,
    name: 'swap_stables_exact_out',
    displayName: 'Swap To Exact Out',
    description: 'Cross-chain swap stables to exact amount out',
    props: {
        ...swapProperties
    },
    async run(context) {
        throw new Error('Not implemented');
    },
});
