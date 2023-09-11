import { Property } from '@activepieces/pieces-framework';
import { CHAINS } from '../../constants';
import { Chain } from 'viem';

export const commonProps = {
    chain: Property.StaticDropdown({
        displayName: 'Chain',
        description: 'Chain to use',
        required: true,
        options: {
            disabled: false,
            options: Object.values(CHAINS)
                .filter((chain): chain is Chain => !!chain)
                .map((chain) => ({
                    value: chain.id,
                    label: chain.name,
                })),
        },
    }),

    network: Property.Object({
        displayName: 'Network',
        description: 'Network data override',
        required: false,
    }),
};
