
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";

export const moonbeam = createPiece({
  displayName: "Moonbeam",
  auth: PieceAuth.None(),
  logoUrl: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-moonbeam.png",
  authors: [],
  actions: [],
  triggers: [],
});
