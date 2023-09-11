
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";

export const cryptoapi = createPiece({
  displayName: "Cryptoapi",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://cdn.activepieces.com/pieces/cryptoapi.png",
  authors: [],
  actions: [],
  triggers: [],
});
