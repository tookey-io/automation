
import { createPiece } from "@activepieces/pieces-framework";
import { sendNative } from "./lib/actions/sendAssets";
import { populateTransaction } from "./lib/actions/populateTransaction";
import { contractCall } from "./lib/actions/call";

export const ethereum = createPiece({
  displayName: "Ethereum",
  logoUrl: "/assets/img/custom/piece/ethereum_mention.png",
  authors: [],
  actions: [sendNative, contractCall, populateTransaction],
  triggers: [],
});
