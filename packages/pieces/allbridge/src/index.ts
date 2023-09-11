
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { SwapStablesExactIn, SwapStablesExactOut } from "./lib/action/swapStables";

export const allbridge = createPiece({
  displayName: "Allbridge",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.7.1',
  logoUrl: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-allbridge.png",
  authors: [],
  actions: [SwapStablesExactIn, SwapStablesExactOut],
  triggers: [],
});
