import { Property, createAction } from "@activepieces/pieces-framework";
import { commonProps } from "./common";
import { mainnet } from "viem/chains";
import * as ethers from "ethers";
import { serializeToHex } from "../serializeToHex";

export const populateTransaction = createAction({
    name: "populateTransaction",
    displayName: "Populate Transaction",
    description: "Populate a transaction with the gas price and nonce",
    props: {
        ...commonProps,
        tx: Property.Object({
            displayName: "Partial transaction",
            description: "Partial transaction to populate",
            required: true,
        }),
    },
    async run({ propsValue: { tx }}) {
        const provider = new ethers.JsonRpcProvider(mainnet.rpcUrls.default.http[0]);
        const signer = new ethers.VoidSigner(tx.from as string, provider);
        const populated = await signer.populateTransaction(tx);

        const serialized = serializeToHex(populated);

        return serialized;
    }
});
