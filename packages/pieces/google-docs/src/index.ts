import { PieceAuth, createPiece } from "@activepieces/pieces-framework";

import { createDocument } from "./lib/actions/create-document";
import { createDocumentBasedOnTemplate } from "./lib/actions/create-document-based-on-template.action";
import { readDocument } from "./lib/actions/read-document.action";

export const googleDocsAuth = PieceAuth.OAuth2({
    
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    required: true,
    scope: ["https://www.googleapis.com/auth/documents"]
})

export const googleDocs = createPiece({
    displayName: "Google Docs",
        minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/google-docs.png",
    authors: ['MoShizzle', 'PFernandez98'],
    auth: googleDocsAuth,
    actions: [createDocument, createDocumentBasedOnTemplate, readDocument],
    triggers: [],
});
