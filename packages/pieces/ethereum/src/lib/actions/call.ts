import {
    DynamicPropsValue,
    Property,
    createAction,
} from '@activepieces/pieces-framework';
import { AbiFunction } from 'abitype';
import * as ethers from 'ethers';
import { Abi } from 'viem';
import { CHAINS, CHAINS_EXPLORER_API } from '../../constants';
import { serializeToHex } from '../serializeToHex';
import { commonProps } from './common';
import axios from 'axios';

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
            required: false,
        }),
        method: Property.Dropdown({
            displayName: 'Method',
            description: 'Method to call',
            refreshers: ['abi', 'contract', 'chain'],
            required: true,
            options: async ({ contract, abi, chain }) => {
                const contractAbi = await collectAbi(
                    contract,
                    abi,
                    chain,
                    {}
                ).catch(e => {
                    return [] as Abi
                });

                return {
                    disabled: false,
                    placeholder: 'Select a method',
                    options: contractAbi
                        .filter(
                            (abi): abi is AbiFunction => abi.type === 'function'
                        )
                        .map((abi) => ({ label: abi.name, value: abi })),
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
    async run({ propsValue: { chain, contract, method, parameters } }) {
        const network = CHAINS[chain];
        if (network === undefined) throw new Error('Invalid chain');

        if (!method) throw new Error('Invalid method');

        const methodAbi = method as AbiFunction;

        if (typeof methodAbi.name !== 'string') {
            throw new Error('Invalid method name');
        }

        if (methodAbi.type !== 'function') {
            throw new Error('Invalid method type');
        }

        if (!Array.isArray(methodAbi.inputs)) {
            throw new Error('Invalid method inputs');
        }

        const provider = new ethers.JsonRpcProvider(
            network.rpcUrls.default.http[0]
        );

        const signer = new ethers.VoidSigner(
            '0xa29e5ded13101DC47A2401Dad9B474b8e4150379',
            provider
        );
        const contractInstance = new ethers.Contract(
            contract,
            JSON.stringify([methodAbi]),
            signer
        );
        console.log(parameters);
        return serializeToHex({
            ...(await contractInstance[methodAbi.name].populateTransaction(
                ...Object.values(parameters)
            )),
        });
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

async function collectAbi(
    contract: unknown,
    abi: unknown,
    chainId: unknown,
    network: undefined | { explorerApi?: string }
): Promise<Abi> {
    if (typeof abi === 'string') {
        try {
            console.log('abi', abi);
            return JSON.parse(abi) as Abi;
        } catch (e) {
            console.log(e);
        }
    }

    const explorer =
        network?.explorerApi ||
        (typeof chainId === 'number'
            ? CHAINS_EXPLORER_API[chainId]
            : undefined);
    if (explorer) {
        console.log('explorer', explorer);
        try {
            // TODO: prevent API overuse! Ask for etherscan API key.
            const response = await axios.get(
                `${explorer}?module=contract&action=getabi&address=${contract}`
            );
            return JSON.parse(response.data.result) as Abi;
        } catch (e: unknown) {
            console.log(e);
        }
    }

    throw new Error('Invalid ABI');
}
