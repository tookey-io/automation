import { Property, createAction } from '@activepieces/pieces-framework';
import {
    GetFunctionArgs,
    encodeFunctionData,
    formatUnits,
    getContract,
    parseUnits,
} from 'viem';
import { EthereumAuth } from '../../index';
import {
    makeTransactionCallProps,
    makeTransactionReadProps,
} from '../properies/transaction';
import { initialize, mapToArgs, resolveAddress } from '../utils';

const ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_spender',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_from',
                type: 'address',
            },
            {
                name: '_to',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: '',
                type: 'uint8',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                name: '',
                type: 'string',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_to',
                type: 'address',
            },
            {
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address',
            },
            {
                name: '_spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        payable: true,
        stateMutability: 'payable',
        type: 'fallback',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
] as const;

export const erc20send = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'erc20_send',
    displayName: 'Send ERC20',
    description: 'Invoke transfer method of ERC20 token contract',
    props: {
        ...makeTransactionCallProps('account', {
            field: 'to',
            name: 'Token',
            description: 'Address or ENS name of the token',
            required: true,
        }),
        recipient: Property.ShortText({
            displayName: 'Recipient',
            description: 'Address or ENS name of the recipient of the transfer',
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
            recipient,
            amount,
            populate,
            failOnRevert,
            overrides,
        },
    }) {
        try {
            const { client, publicClient } = await initialize(auth, account);
            const tokenAddress = await resolveAddress(client, to);
            const recipientAddress = await resolveAddress(client, recipient);
            const tokenInstance = getContract({
                address: tokenAddress,
                abi: ABI,
                publicClient,
            });

            const args = mapToArgs<
                GetFunctionArgs<typeof ABI, 'transfer'>['args']
            >({
                '0': recipientAddress,
                '1': parseUnits(amount, await tokenInstance.read.decimals()),
            });

            const data = encodeFunctionData({
                abi: ABI,
                functionName: 'transfer',
                args,
            });

            return client.safeCall(
                ABI,
                {
                    to: tokenAddress,
                    data,
                    ...overrides,
                },
                populate,
                failOnRevert
            );
        } catch (e) {
            console.debug(e);
            throw e;
        }
    },
});

export const erc20approve = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'erc20_approve',
    displayName: 'Approve ERC20',
    description: 'Approve spending of ERC20 for provided address',
    props: {
        ...makeTransactionCallProps('account', {
            field: 'to',
            name: 'Token',
            description: 'Address or ENS name of the token',
            required: true,
        }),
        spender: Property.ShortText({
            displayName: 'Spender',
            description: 'Address or ENS name of the spender',
            required: true,
        }),
        amount: Property.ShortText({
            displayName: 'Allowance',
            description:
                'Amount of allowance to spend (in human readable form, such as 1.5)',
            required: true,
        }),
    },

    async run({
        auth,
        propsValue: {
            to,
            account,
            spender,
            amount,
            populate,
            failOnRevert,
            overrides,
        },
    }) {
        try {
            const { client, publicClient } = await initialize(auth, account);
            const tokenAddress = await resolveAddress(client, to);
            const spenderAddress = await resolveAddress(client, spender);
            const tokenInstance = getContract({
                address: tokenAddress,
                abi: ABI,
                publicClient,
            });

            const args = mapToArgs<
                GetFunctionArgs<typeof ABI, 'approve'>['args']
            >({
                '0': spenderAddress,
                '1': parseUnits(amount, await tokenInstance.read.decimals()),
            });

            const data = encodeFunctionData({
                abi: ABI,
                functionName: 'approve',
                args,
            });

            return client.safeCall(
                ABI,
                {
                    to: tokenAddress,
                    data,
                    ...overrides,
                },
                populate,
                failOnRevert
            );
        } catch (e) {
            console.debug(e);
            throw e;
        }
    },
});

export const erc20balance = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'erc20_balance',
    displayName: 'Read ERC20 Balance',
    description: 'Reads balance of ERC20 for provided address',
    props: {
        ...makeTransactionReadProps(
            {
                field: 'to',
                name: 'Token',
                description: 'Address or ENS name of the token',
                required: true,
            },
            {
                field: 'account',
                name: 'Owner',
                description:
                    'Address or ENS name of the balance owner (will overrides provided by connection)',
                required: false,
            }
        ),
    },

    async run({ auth, propsValue: { to, account, overrides } }) {
        console.debug('auth', auth);
        console.debug('to', to);
        console.debug('account', account);
        const { client, publicClient } = await initialize(auth);
        const tokenAddress = await resolveAddress(client, to);
        const ownerAddress = await resolveAddress(
            client,
            account ?? auth.address
        );
        const tokenInstance = getContract({
            address: tokenAddress,
            abi: ABI,
            publicClient,
        });

        console.debug('tokenInstance', tokenInstance);
        console.debug('ownerAddress', ownerAddress);

        const [balance, decimals, symbol, name] = await Promise.all([
            tokenInstance.read.balanceOf([ownerAddress], overrides),
            tokenInstance.read.decimals(overrides).catch(() => 1),
            tokenInstance.read.symbol(overrides).catch(() => 'N/A'),
            tokenInstance.read.name(overrides).catch(() => 'Unnamed'),
        ]);

        console.debug('balance', balance);
        console.debug('decimals', decimals);
        console.debug('symbol', symbol);
        console.debug('name', name);

        return {
            balance,
            decimals,
            symbol,
            name,
            parsedBalance: formatUnits(balance, decimals)
        };
    },
});



export const erc20allowance = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'erc20_allowance',
    displayName: 'ERC20 Allowance',
    description: 'Reads allowance of ERC20 for provided owner (or connection address) and spender',
    props: {
        ...makeTransactionReadProps(
            {
                field: 'to',
                name: 'Token',
                description: 'Address or ENS name of the token',
                required: true,
            },
            {
                field: 'account',
                name: 'Owner',
                description:
                    'Address or ENS name of the balance owner (will overrides provided by connection)',
                required: false,
            }
        ),
        spender: Property.ShortText({
            displayName: 'Spender',
            description: 'Address or ENS name of the spender',
            required: true,
        }),
    },

    async run({ auth, propsValue: { to, account, spender, overrides } }) {
        console.debug('auth', auth);
        console.debug('to', to);
        console.debug('account', account);
        const { client, publicClient } = await initialize(auth);
        const tokenAddress = await resolveAddress(client, to);
        const spenderAddress = await resolveAddress(client, spender);
        const ownerAddress = await resolveAddress(
            client,
            account ?? auth.address
        );
        const tokenInstance = getContract({
            address: tokenAddress,
            abi: ABI,
            publicClient,
        });

        console.debug('tokenInstance', tokenInstance);
        console.debug('ownerAddress', ownerAddress);

        const [allowance, decimals, symbol, name] = await Promise.all([
            tokenInstance.read.allowance([ownerAddress, spenderAddress], overrides),
            tokenInstance.read.decimals(overrides).catch(() => 1),
            tokenInstance.read.symbol(overrides).catch(() => 'N/A'),
            tokenInstance.read.name(overrides).catch(() => 'Unnamed'),
        ]);

        console.debug('allowance', allowance);
        console.debug('decimals', decimals);
        console.debug('symbol', symbol);
        console.debug('name', name);

        return {
            allowance,
            decimals,
            symbol,
            name,
            parsedAllowance: formatUnits(allowance, decimals)
        };
    },
});
