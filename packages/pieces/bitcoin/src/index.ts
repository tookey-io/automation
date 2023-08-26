
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";

export const bitcoin = createPiece({
  displayName: "Bitcoin",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://cdn.activepieces.com/pieces/bitcoin.png",
  authors: [],
  actions: [],
  triggers: [],
});
