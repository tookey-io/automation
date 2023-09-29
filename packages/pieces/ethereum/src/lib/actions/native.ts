import { Property, createAction } from '@activepieces/pieces-framework';
import {
    GetFunctionArgs,
    encodeFunctionData,
    formatUnits,
    getContract,
    parseEther,
    parseUnits,
} from 'viem';
import { EthereumAuth } from '../../index';
import {
    makeTransactionCallProps,
    makeTransactionReadProps,
} from '../properies/transaction';
import { initialize, mapToArgs, resolveAddress } from '../utils';


export const nativeSend = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'native_send',
    displayName: 'Send Native',
    description: 'Creates the sending transaction of native (gas) currency to provided address',
    props: {
        ...makeTransactionCallProps('account', {
            field: 'to',
            name: 'Recipient',
            description: 'Address or ENS name of the recipient',
            required: true,
        }),
        amount: Property.ShortText({
            displayName: 'Amount',
            description: 'Amount to send (in human readable form, such as 1.5)',
            required: true,
        }),
    },

    async run({
        auth,
        propsValue: {
            to,
            account,
            amount,
            populate,
            failOnRevert,
            overrides,
        },
    }) {
        try {
            const { client, chain } = await initialize(auth, account);
            const value = parseUnits(amount, chain.nativeCurrency.decimals)
            if (populate) {
            return client.populate(
                {
                    to,
                    data: '0x',
                    value,
                    ...overrides,
                },
                failOnRevert
            );
            } else {
                return {
                    to,
                    value,
                }
            }
        } catch (e) {
            console.debug(e);
            throw e;
        }
    },
});

export const nativeBalance = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'native_balance',
    displayName: 'Read Native Balance',
    description: 'Reads balance of the native (gas) currency for provided address (or connection address)',
    props: {
        ...makeTransactionReadProps(
            {
                field: 'account',
                name: 'Owner',
                description:
                    'Address or ENS name of the balance owner (will overrides provided by connection)',
                required: false,
            }
        ),
    },

    async run({ auth, propsValue: { account, overrides } }) {
        const { client, chain } = await initialize(auth);
        const ownerAddress = await resolveAddress(
            client,
            account || auth.address
        );
        const [balance, decimals, symbol, name] = await Promise.all([
            client.getBalance({ address: ownerAddress }),
            chain.nativeCurrency.decimals,
            chain.nativeCurrency.symbol,
            chain.nativeCurrency.name,
        ]);

        return {
            balance,
            decimals,
            symbol,
            name,
            parsedBalance: formatUnits(balance, chain.nativeCurrency.decimals)
        };
    },
});