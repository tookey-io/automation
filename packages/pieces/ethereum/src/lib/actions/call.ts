import {
    DynamicPropsValue,
    Property,
    createAction
} from '@activepieces/pieces-framework';
import { AbiFunction } from 'abitype';
import { Abi, createPublicClient, encodeFunctionData, http } from 'viem';
import { EthereumAuth } from '../../index';
import { fetchChain, resolveAddress } from '../utils';

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
                    const contractAbi = Array.isArray(abi) ? abi as Abi : typeof abi === 'object' && "abi" in abi ? abi.abi as Abi : undefined;
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
                const fields: DynamicPropsValue = {};
                try {
                    methodAbi.inputs.forEach((input, index) => {
                        fields[index] = Property.ShortText({
                            displayName: input.name || `arg${index}`,
                            description: input.name,
                            required: true,
                        });
                    });
                } catch (e) {
                    console.log(e);
                }
                return fields;
            },
        }),
    },

    async run({ auth, propsValue: { contract, abi, method, parameters } }) {
        const chain = await fetchChain(auth);
        const client = createPublicClient({
            chain,
            transport: http()
        })
        const account = await resolveAddress(client, auth.address)
        const to = await resolveAddress(client, contract)

        if (typeof method.name !== 'string') {
            throw new Error('Invalid method name');
        }

        if (method.type !== 'function') {
            throw new Error('Invalid method type');
        }

        if (!Array.isArray(method.inputs)) {
            throw new Error('Invalid method inputs');
        }

        const data = encodeFunctionData({
            abi: [method],
            functionName: method.name,
            args: Object.values(parameters)
        })

        return client.prepareTransactionRequest({
            account,
            to,
            data
        })
    },
});