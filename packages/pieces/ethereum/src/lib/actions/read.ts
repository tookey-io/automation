import {
    DynamicPropsValue,
    Property,
    Validators,
    createAction,
} from '@activepieces/pieces-framework';
import { AbiFunction } from 'abitype';
import {
    Abi,
    EstimateGasExecutionError,
    createPublicClient,
    createWalletClient,
    decodeFunctionData,
    decodeFunctionResult,
    encodeFunctionData,
    http,
    keccak256,
    parseUnits,
    serializeTransaction,
} from 'viem';
import { EthereumAuth } from '../../index';
import {
    fetchChain,
    functionAbiToFields,
    initialize,
    mapToArgs,
    resolveAddress,
} from '../utils';
import { privateKeyToAccount } from 'viem/accounts';
import { makeTransactionReadProps } from '../properies/transaction';

export const contractRead = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'contract_read',
    displayName: 'Contract Read',
    description: 'Read a contract with the given parameters',
    props: {
        ...makeTransactionReadProps(
            {
                field: 'to',
                name: 'Contract',
                description: 'Address or ENS name of the contract',
                required: true,
            },
            {
                field: 'account',
                name: 'From',
                description:
                    'Reader address (will override provided by connection)',
                required: false,
            },
            'value'
        ),
        abi: Property.Json({
            displayName: 'ABI',
            description: 'JSON encoded ABI',
            required: false,
        }),
        method: Property.Dropdown<AbiFunction, true>({
            displayName: 'Method',
            description: 'Method to call',
            refreshers: ['contract', 'abi'],
            required: true,
            async options({ contract, abi, auth }) {
                if (abi) {
                    const jsonAbi = JSON.parse(abi as string);
                    const contractAbi = Array.isArray(jsonAbi)
                        ? (jsonAbi as Abi)
                        : typeof jsonAbi === 'object' && 'abi' in jsonAbi
                            ? (jsonAbi.abi as Abi)
                            : undefined;
                    if (!contractAbi) {
                        return {
                            disabled: true,
                            placeholder: `Invalid ABI (typeof abi === ${typeof abi})`,
                            options: [],
                        };
                    }
                    return {
                        disabled: false,
                        placeholder: 'Select a method',
                        options: contractAbi
                            .filter(
                                (func): func is AbiFunction =>
                                    func.type === 'function'
                            )
                            .map((abi) => ({ label: abi.name, value: abi })),
                    };
                }

                return {
                    disabled: true,
                    placeholder: 'Please enter an ABI JSON',
                    options: [],
                };
            },
        }),
        parameters: Property.DynamicProperties({
            displayName: 'Arguments',
            description: 'Arguments to pass to the contract method',
            refreshers: ['method'],
            required: true,
            props: async ({ method }) => {
                if (!method) return {};
                const methodAbi = method as AbiFunction;
                console.log('method abi', methodAbi);
                return functionAbiToFields(methodAbi);
            },
        }),
    },

    async run({
        auth,
        propsValue: {
            to: toProp,
            value: valueHuman,
            overrides,
            account: accountProp,
            method,
            parameters,
            failOnRevert,
        },
    }) {
        console.debug('test');
        // 0xEa53f634BD4Bb113eE55ea679F7825d2a0dFD4A8
        // 0x0000000000000000000000000000000000000000
        try {
            const { client, account } = await initialize(auth, accountProp);
            const to = await resolveAddress(client, toProp);
            const value = valueHuman
                ? parseUnits(valueHuman.toString(), 18)
                : undefined;

            if (typeof method.name !== 'string') {
                throw new Error('Invalid method name');
            }

            if (method.type !== 'function') {
                throw new Error('Invalid method type');
            }

            if (!Array.isArray(method.inputs)) {
                throw new Error('Invalid method inputs');
            }

            const args = mapToArgs(parameters as Record<string, any>);

            const data = encodeFunctionData({
                abi: [method],
                functionName: method.name,
                args,
            });

            try {
                const response = await client
                    .call({
                        to,
                        account,
                        data,
                        value,
                        ...overrides,
                    })
                    .then((r) => ({
                        raw: r.data,
                        parsed: r.data
                            ? decodeFunctionResult({
                                abi: [method],
                                functionName: method.name,
                                data: r.data,
                            })
                            : undefined
                    }));

                return {
                    response,
                    to,
                    account,
                    data,
                    value,
                    ...overrides,
                }
            } catch (error) {
                if (failOnRevert) {
                    throw error
                }

                return {
                    error,
                    to,
                    account,
                    data,
                    value,
                    ...overrides,
                }
            }
        } catch (e) {
            console.debug(e);
            throw e;
        }
    },
});
