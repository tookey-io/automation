import {
    createAction
} from '@activepieces/pieces-framework';
import { CHAINS } from '../../constants';
import { commonProps } from './common';

export const getNetwork = createAction({
    name: 'getNetwork',
    displayName: 'Get Network',
    description: 'Returns the network data based on selected chain id',
    props: {
        ...commonProps,
    },
    async run({ propsValue: { chain } }) {
        return CHAINS[chain];
    },
});
