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
import { HttpMethod, httpClient } from '@activepieces/pieces-common';

export const contractCall = createAction({
    requireAuth: false,
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
            refreshers: ['contract', 'chain'],
            required: true,
            options: async ({ contract, abi, chain }) => {
                const contractAbi = await collectAbi(
                    contract,
                    abi,
                    chain
                ).catch((e) => {
                    return [] as Abi;
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
    chainId: unknown
): Promise<Abi> {
    console.log('collecting abi for ' + contract)

    if (typeof contract !== 'string') {
        throw new Error('Invalid contract');
    }
    if (typeof abi === 'string' && abi.length > 0) {
        try {
            console.log('abi', abi);
            return JSON.parse(abi) as Abi;
        } catch (e) {
            console.log(e);
        }
    }

    if (typeof chainId === 'number') {
        const network = CHAINS[chainId as number];

        if (!network) {
            throw new Error('Invalid chain');
        }

        const explorer =
            typeof chainId === 'number'
                ? CHAINS_EXPLORER_API[chainId]
                : undefined;

        if (!explorer) {
            throw new Error(
                'Ensure configuration of explorer API for chain ' + chainId
            );
        }

        const provider = new ethers.JsonRpcProvider(
            network.rpcUrls.default.http[0]
        );

        const implementantion = await provider
            .getStorage(
                contract,
                // bytes32 private constant _IMPLEMENTATION_SLOT;
                '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
            )
            .then(
                (res) =>
                    ethers.AbiCoder.defaultAbiCoder().decode(
                        ['address'],
                        res
                    )[0] as string
            )
            .then((res) => (res === ethers.ZeroAddress ? undefined : res));

        const fetchAbi = (explorerUrl: string, address?: string) =>
            address
                ? httpClient
                      .sendRequest<{ result: string }>({
                          method: HttpMethod.GET,
                          url: `${explorerUrl}?module=contract&action=getabi&address=${address}`,
                      })
                      .then((res) => JSON.parse(res.body.result) as Abi)
                : Promise.resolve([] as Abi);

        const abis = await Promise.all([
            fetchAbi(explorer, contract).catch(
                (e) => (
                    console.error(`Failed to fetch ${contract} (contract) abi`),
                    [] as Abi
                )
            ),
            fetchAbi(explorer, implementantion).catch(
                (e) => (
                    console.error(
                        `Failed to fetch ${implementantion} (implementantion) abi`
                    ),
                    [] as Abi
                )
            ),
        ]);
        return abis.flat();
    }

    throw new Error('Invalid ABI');
}
