import {
    DynamicPropsValue,
    Property,
    createAction,
} from '@activepieces/pieces-framework';
import { commonProps } from './common';
import * as ethers from 'ethers';
import { CHAINS } from '../../constants';
import { encodeFunctionData, Abi } from 'viem';
import { AbiFunction } from 'abitype';
import { inspect } from 'util';
import { serializeToHex } from '../serializeToHex';

export const contractCall = createAction({
    name: 'contractCall',
    displayName: 'Contract Call',
    description: 'Call a contract method with the given parameters',
    props: {
        ...commonProps,
        contract: Property.ShortText({
            displayName: 'To Address',
            description: 'To Address',
            required: true,
        }),
        abi: Property.ShortText({
            displayName: 'ABI',
            description: 'JSON encoded ABI',
            required: true,
        }),
        method: Property.Dropdown({
            displayName: 'Method',
            description: 'Method to call',
            refreshers: ['abi'],
            required: true,
            options: async ({ abi }) => {
                if (!abi)
                    return {
                        disabled: true,
                        options: [{ label: 'ABI is required', value: 'error' }],
                    };
                const possibleAbi = JSON.parse(abi as unknown as string);
                if (
                    typeof possibleAbi !== 'object' ||
                    !Array.isArray(possibleAbi)
                ) {
                    return {
                        disabled: true,
                        options: [
                            {
                                label:
                                    typeof possibleAbi +
                                    ' ' +
                                    Array.isArray(possibleAbi),
                                value: 'error',
                            },
                        ],
                    };
                }
                const iabi = possibleAbi as Abi;

                return {
                    disabled: false,
                    options: iabi
                        .filter(
                            (abi): abi is AbiFunction => abi.type === 'function'
                        )
                        .map((abi) => ({ label: abi.name, value: abi.name })),
                };
            },
        }),
        parameters: Property.DynamicProperties({
            displayName: 'Arguments',
            description: 'Arguments to pass to the contract method',
            refreshers: ['abi', 'method'],
            required: true,
            props: async ({ abi, method }) => {
                if (!abi) return {};
                if (!method) return {};
                console.log('method abi', method)
                const fields: DynamicPropsValue = {};
                try {
                    const methodAbi = (
                        JSON.parse(abi as unknown as string) as Abi
                    )
                        .filter(
                            (abi): abi is AbiFunction => abi.type === 'function'
                        )
                        .find(
                            (abi) => abi.name === (method as unknown as string)
                        );
                    if (!methodAbi) return {};

                    methodAbi.inputs.forEach((input, index) => {
                        fields[index] = Property.ShortText({
                            displayName: input.name || `arg${index}`,
                            description: input.name,
                            required: input.type.endsWith('[]'),
                        });
                    });
                } catch (e) {
                    console.log(e);
                }
                return fields;
            },
        }),
    },
    async run({ propsValue: { chain, contract, method, abi, parameters } }) {
        const provider = new ethers.JsonRpcProvider(CHAINS[chain].rpcUrls.default.http[0]);
        const signer = new ethers.VoidSigner("0xa29e5ded13101DC47A2401Dad9B474b8e4150379", provider);
        const contractInstance = new ethers.Contract(contract, JSON.parse(abi as unknown as string), signer);
        console.log(parameters)
        return serializeToHex({
            ...await contractInstance[method].populateTransaction(...Object.values(parameters)),
            from: "0xa29e5ded13101DC47A2401Dad9B474b8e4150379"
        })
        // from = await ethers.resolveAddress(from, provider);
        // to = await ethers.resolveAddress(to, provider);
        // const value = ethers.toBeHex(ethers.parseEther(amount.toString()));
        // return {
        //     from,
        //     to,
        //     value,
        // };
    },
});
