
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { sendNative } from "./lib/actions/sendAssets";
import { contractCall } from "./lib/actions/call";
import { populateTransaction } from "./lib/actions/populateTransaction";
import { getNetwork } from "./lib/actions/populateNetwork";
import { broadcastTransaction } from "./lib/actions/broadcast";

export const ethereum = createPiece({
  displayName: "Ethereum",
  auth: PieceAuth.None(),
  logoUrl: "/assets/img/custom/piece/ethereum_mention.png",
  authors: [],
  actions: [getNetwork, sendNative, contractCall, populateTransaction, broadcastTransaction],
  triggers: [],
});
