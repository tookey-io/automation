
import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { sendEmail } from "./lib/actions/send-email";

export const resendAuth = PieceAuth.SecretText({
  displayName: "API Key",
  required: true,
})

export const resend = createPiece({
  displayName: "Resend",
      minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/resend.png",
  authors: [],
  auth: resendAuth,
  actions: [sendEmail],
  triggers: [],
});
