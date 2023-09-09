
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { FetchOrdinals } from "./lib/action/fetchOrdinals";

export const bitcoin = createPiece({
  displayName: "Bitcoin",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://cdn.activepieces.com/pieces/bitcoin.png",
  authors: [],
  actions: [FetchOrdinals],
  triggers: [],
});
