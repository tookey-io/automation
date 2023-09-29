import {
    DynamicPropsValue,
    Property,
    Validators,
    createAction
} from '@activepieces/pieces-framework';
import { AbiFunction } from 'abitype';
import { Abi, EstimateGasExecutionError, createPublicClient, createWalletClient, decodeFunctionData, encodeFunctionData, http, keccak256, parseUnits, serializeTransaction } from 'viem';
import { EthereumAuth } from '../../index';
import { fetchChain, functionAbiToFields, initialize, mapToArgs, resolveAddress } from '../utils';
import { privateKeyToAccount } from 'viem/accounts'

export const contractCall = createAction({
    auth: EthereumAuth,
    requireAuth: true,
    name: 'contract_call',
    displayName: 'Contract Call',
    description: 'Call a contract method with the given parameters',
    props: {
        contract: Property.ShortText({
            displayName: 'Contract',
            description: 'Address or ENS name of the contract',
            required: true,
        }),
        from: Property.ShortText({
            displayName: 'Sender',
            description: 'Sender address (will override provided by connection)',
            required: false,
        }),
        abi: Property.Json({
            displayName: 'ABI',
            description: 'JSON encoded ABI',
            required: false,
        }),
        populate: Property.Checkbox({
            displayName: 'Populate',
            description: 'Populate transaction from network (gas, nonce, simulation)',
            required: false,
            defaultValue: true
        }),
        failOnRevert: Property.Checkbox({
            displayName: 'Fail on revert',
            description: 'Fail if the transaction simulation reverts',
            required: false,
            defaultValue: true
        }),
        method: Property.Dropdown<AbiFunction, true>({
            displayName: 'Method',
            description: 'Method to call',
            refreshers: ['contract', 'abi'],
            required: true,
            async options({ contract, abi, auth }) {
                if (abi) {
                    const jsonAbi = JSON.parse(abi as string);
                    const contractAbi = Array.isArray(jsonAbi) ? jsonAbi as Abi : typeof jsonAbi === 'object' && "abi" in jsonAbi ? jsonAbi.abi as Abi : undefined;
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
                                (func): func is AbiFunction => func.type === 'function'
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
        value: Property.Number({
            displayName: 'Value',
            description: 'Value to send with the transaction (in human readable form, such as 1.5 ETH)',
            required: false
        }),
        overrides: Property.Object({
            displayName: 'Call overrides (gasLimit, gasPrice, nonce, etc.)',
            required: false
        })
    },

    async run({ auth, propsValue: { contract, value: valueHuman, overrides, from, method, parameters, populate, failOnRevert } }) {
        console.debug('test');
        // 0xEa53f634BD4Bb113eE55ea679F7825d2a0dFD4A8
        // 0x0000000000000000000000000000000000000000
        try {
            const { client, account } = await initialize(auth, from);

            const to = await resolveAddress(client, contract)

            const value = valueHuman ? parseUnits(valueHuman.toString(), 18) : undefined

            if (typeof method.name !== 'string') {
                throw new Error('Invalid method name');
            }

            if (method.type !== 'function') {
                throw new Error('Invalid method type');
            }

            if (!Array.isArray(method.inputs)) {
                throw new Error('Invalid method inputs');
            }

            const args = mapToArgs(parameters as Record<string, any>)

            const data = encodeFunctionData({
                abi: [method],
                functionName: method.name,
                args,
            })

            return client.safeCall(
                [method],
                {
                    to,
                    data,
                    value,
                    ...overrides
                },
                populate,
                failOnRevert
            )
        } catch (e) {
            console.debug(e);
            throw e;
        }
    },
});