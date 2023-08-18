import { getFileAction } from './lib/actions/get-file-action';
import { getCommentsAction } from './lib/actions/get-comments-action';
import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { postCommentAction } from './lib/actions/post-comment-action';
import { newCommentTrigger } from './lib/trigger/new-comment';

export const figmaAuth = PieceAuth.OAuth2({
    description: '',
    
    authUrl: 'https://www.figma.com/oauth',
    tokenUrl: 'https://www.figma.com/api/oauth/token',
    required: true,
    scope: [
        'file_read',
    ],
});

export const figma = createPiece({
    displayName: "Figma",
        minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/figma.png',
    auth: figmaAuth,
    actions: [
        getFileAction,
        getCommentsAction,
        postCommentAction,
    ],
    triggers: [
        newCommentTrigger,
    ]
});
