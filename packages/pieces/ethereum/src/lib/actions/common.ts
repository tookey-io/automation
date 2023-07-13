import { Property } from '@activepieces/pieces-framework';
import { CHAINS } from '../../constants';

export const commonProps = {
    chain: Property.Dropdown({
        displayName: 'Chain',
        description: 'Chain to use',
        required: true,
        refreshers: [],
        options: async () => ({
            disabled: false,
            options: Object.values(CHAINS).map((chain) => ({
                value: chain.id,
                label: chain.name,
            })),
        }),
    }),
};
