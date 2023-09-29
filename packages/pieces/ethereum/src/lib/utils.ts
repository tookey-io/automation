import { normalize } from 'viem/ens';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import {
    Abi,
    Address,
    CallParameters,
    Chain,
    Client,
    Hex,
    PublicClient,
    createPublicClient,
    createWalletClient,
    decodeAbiParameters,
    decodeFunctionData,
    defineChain,
    http,
    isAddress,
    keccak256,
    publicActions,
    walletActions,
    zeroAddress,
    serializeTransaction,
    EstimateGasExecutionError,
} from 'viem';
import { CHAINS } from './constants';
import { EthereumAuth } from '..';
import {
    DynamicPropsValue,
    PiecePropValueSchema,
    Property,
} from '@activepieces/pieces-framework';
import { AbiFunction, AbiParameter } from 'abitype';

export const initialize = async (
    auth: PiecePropValueSchema<typeof EthereumAuth>,
    from?: string 
) => {
    const chain = await fetchChain(auth);
    const publicClient = createPublicClient({
        chain,
        transport: http(),
    });
    const account = await resolveAddress(publicClient, from ?? auth.address ?? zeroAddress);

    return {
        client: createExtendedClient(account, chain),
        publicClient,
        chain,
        account
    };
}

export const createExtendedClient = (account: Address, chain: Chain) =>
    createWalletClient({
        account,
        chain,
        transport: http(),
    })
        .extend(publicActions)
        .extend((client) => ({
            async safeCall(
                abi: Abi,
                args: CallParameters,
                populate?: boolean,
                failOnRevert?: boolean
            ) {
                if (!args.data)
                    throw new Error('Missing data field in call parameters');

                const callData = decodeFunctionData({
                    abi,
                    data: args.data,
                });

                if (!populate) {
                    return {
                        ...args,
                        callData,
                    };
                } else {
                    try {
                        const tx = await client.prepareTransactionRequest({
                            ...args,
                            account,
                        });
                        const chainId = client.chain.id;

                        const signHash = keccak256(
                            serializeTransaction({
                                chainId,
                                ...tx,
                            })
                        );

                        return {
                            chainId,
                            ...tx,
                            account: undefined,
                            signHash,
                            callData,
                        };
                    } catch (e) {
                        if (
                            !failOnRevert &&
                            e instanceof EstimateGasExecutionError
                        ) {
                            return {
                                ...e,
                                tx: {
                                    ...args,
                                    callData,
                                },
                            };
                        } else {
                            throw e;
                        }
                    }
                }
            },
        }));

export const mapToArgs = <T = unknown[]>(params: Record<string, any>) => {
    const args: unknown[] = [];

    Object.entries(params).forEach(([path, value]) => {
        let targetArgsSlice = args;

        const indexes = path.split('.').map(Number);
        if (indexes.some((i) => isNaN(i) || i < 0)) {
            throw new Error(
                `Invalid path ${path}. Should contain only positive integers separated by dots`
            );
        }

        const index = indexes.pop();

        if (typeof index === 'undefined') {
            throw new Error(
                `Invalid path ${path}. Should contain at least one positive integer`
            );
        }

        while (indexes.length > 0) {
            const i = indexes.shift()!; // safe because of while condition
            if (typeof targetArgsSlice[i] === 'undefined') {
                targetArgsSlice[i] = [];
            } else if (!Array.isArray(targetArgsSlice[i])) {
                throw new Error(
                    `Invalid path ${path}. ${i} is not an array. Got ${targetArgsSlice[i]}`
                );
            }
            targetArgsSlice = targetArgsSlice[i] as unknown[];
        }

        targetArgsSlice[index] = value;
    });

    return args as T;
};

export const parameterToField = (
    path: number[],
    types: string[],
    names: string[],
    input: AbiParameter,
    fields: DynamicPropsValue
) => {
    const name = input.name || path[path.length - 1].toString();
    const ty =
        input.internalType?.replace(/^(struct |contract )/, '') || input.type;
    if (input.type === 'tuple' && 'components' in input) {
        // recursive
        input.components.forEach((component, index) => {
            parameterToField(
                [...path, index],
                [...types, ty],
                [...names, name],
                component,
                fields
            );
        });
    } else {
        fields[path.join('.')] = Property.ShortText({
            displayName: [...names, name].join('.'),
            description: [...types, ty].join('.'),
            required: true,
        });
    }
};
export const functionAbiToFields = (method: AbiFunction): DynamicPropsValue => {
    const fields: DynamicPropsValue = {};
    method.inputs.forEach((input, index) =>
        parameterToField([index], [], [], input, fields)
    );
    return fields;
};

export const resolveAddress = async (
    client: ReturnType<typeof createExtendedClient> | PublicClient,
    possibleAddress: undefined | string
): Promise<Address> => {
    if (!possibleAddress) {
        throw new Error('No address provided');
    }

    if (isAddress(possibleAddress)) {
        return possibleAddress;
    } else {
        return client
            .getEnsAddress({ name: normalize(possibleAddress) })
            .then((r) => {
                if (!r)
                    throw new Error(
                        `Could not resolve address for ${possibleAddress}`
                    );

                return r;
            });
    }
};
export const fetchChain = async (
    auth: PiecePropValueSchema<typeof EthereumAuth>
) => {
    const unknownChain = defineChain({
        name: 'Unknown',
        id: 1,
        rpcUrls: {
            default: {
                http: [auth.rpc],
            },
            public: {
                http: [auth.rpc],
            },
        },
        network: 'unknown',
        nativeCurrency: {
            name: 'Unknown Currency',
            symbol: 'CUR',
            decimals: 18,
        },
    });

    const unknownClient = createPublicClient({
        chain: unknownChain,
        transport: http(),
    });

    const id = await unknownClient.getChainId();
    const chain = Object.values(CHAINS).find((chain) => chain?.id === id);

    return defineChain({
        ...unknownChain,
        ...chain,
        rpcUrls: {
            default: {
                http: [auth.rpc],
            },
            public: {
                http: [auth.rpc],
            },
        },
    }) as Chain;
};

export const fetchImplementationAddress = (
    client: PublicClient,
    address: Address
) => {
    return client
        .getStorageAt({
            address,
            // bytes32 private constant _IMPLEMENTATION_SLOT;
            slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        })
        .then((res) => {
            const [address] = res
                ? (decodeAbiParameters(['address'], res) as [Address])
                : [undefined];
            return address === zeroAddress ? undefined : address;
        });
};

export const fetchExplorerAbi = (
    explorerUrl: string,
    apiKey: string,
    address: Address
) => {
    return httpClient
        .sendRequest<{ result: string }>({
            method: HttpMethod.GET,
            url: `${explorerUrl}?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
        })
        .then((res) => JSON.parse(res.body.result) as Abi);
};
