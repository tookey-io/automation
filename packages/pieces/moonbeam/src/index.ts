
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";

export const moonbeam = createPiece({
  displayName: "Moonbeam",
  auth: PieceAuth.None(),
  logoUrl: "https://cdn.activepieces.com/pieces/moonbeam.png",
  authors: [],
  actions: [],
  triggers: [],
});
