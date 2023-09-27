import { normalize } from 'viem/ens'
import { HttpMethod, httpClient } from "@activepieces/pieces-common";
import { Abi, Address, Chain, Client, PublicClient, createPublicClient, decodeAbiParameters, defineChain, http, isAddress, zeroAddress } from "viem";
import { CHAINS } from "./constants";
import { EthereumAuth } from "..";
import { PiecePropValueSchema } from "@activepieces/pieces-framework";

export const resolveAddress = async (client: PublicClient, possibleAddress: undefined | string): Promise<Address> => {
    if (!possibleAddress) {
        throw new Error('No address provided')
    }

    if (isAddress(possibleAddress)) {
        return possibleAddress
    } else {
        return client.getEnsAddress({ name: normalize(possibleAddress) }).then(r => {
            if (!r)
                throw new Error(`Could not resolve address for ${possibleAddress}`)

            return r
        })
    }
}
export const fetchChain = async (auth: PiecePropValueSchema<typeof EthereumAuth>) => {
    const unknownChain = defineChain({
        name: 'Unknown',
        id: 1,
        rpcUrls: {
            default: {
                http: [auth.rpc]
            },
            public: {
                http: [auth.rpc]
            },
        },
        network: 'unknown',
        nativeCurrency: {
            name: 'Unknown Currency',
            symbol: 'CUR',
            decimals: 18
        }
    })

    const unknownClient = createPublicClient({
        chain: unknownChain,
        transport: http()
    })

    const id = await unknownClient.getChainId()
    const chain = Object.values(CHAINS).find((chain) => chain?.id === id)

    return defineChain({
        ...unknownChain,
        ...chain,
        rpcUrls: {
            default: {
                http: [auth.rpc]
            },
            public: {
                http: [auth.rpc]
            },
        },
    }) as Chain
}

export const fetchImplementationAddress = (client: PublicClient, address: Address) => {
    return client.getStorageAt({
        address,
        // bytes32 private constant _IMPLEMENTATION_SLOT;
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    }).then((res) => {
        const [address] = res ? decodeAbiParameters(['address'], res) as [Address] : [undefined]
        return address === zeroAddress ? undefined : address
    });
}

export const fetchExplorerAbi = (explorerUrl: string, apiKey: string, address: Address) => {
    return httpClient
        .sendRequest<{ result: string }>({
            method: HttpMethod.GET,
            url: `${explorerUrl}?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
        })
        .then((res) => JSON.parse(res.body.result) as Abi)
}