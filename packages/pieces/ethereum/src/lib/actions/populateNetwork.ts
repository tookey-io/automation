import {
    createAction
} from '@activepieces/pieces-framework';
import { CHAINS } from '../constants';
import { EthereumAuth } from '../../index';
import { createPublicClient, defineChain, http } from 'viem';
import { fetchChain } from '../utils';

export const getNetwork = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'get_chain',
    displayName: 'Get Chain',
    description: 'Returns the chain data based on provided RPC URL',
    props: {},
    async run({ auth }) {
        return fetchChain(auth)
    },
});
