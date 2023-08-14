import { Property, createAction } from "@activepieces/pieces-framework";
import { commonProps } from "./common";
import { mainnet } from "viem/chains";
import * as ethers from "ethers";
import { serializeToHex } from "../serializeToHex";
import { CHAINS } from "../../constants";

export const broadcastTransaction = createAction({
    name: "broadcastTransaction",
    displayName: "Broadcast Tx",
    description: "Broadcast a transaction",
    props: {
        ...commonProps,
        serializedTx: Property.ShortText({
            displayName: "Serialized tx",
            description: "Serialized tx to broadcast",
            required: true,
        }),
    },
    async run({ propsValue: { serializedTx, chain }}) {
        const network = CHAINS[chain];
        if (!network) throw new Error('Invalid chain');
        const provider = new ethers.JsonRpcProvider(network.rpcUrls.default.http[0]);

        return provider.broadcastTransaction(serializedTx)
    }
});
