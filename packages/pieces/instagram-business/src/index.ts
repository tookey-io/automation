import { createPiece } from "@activepieces/pieces-framework";
import { uploadPhoto } from "./lib/actions/upload-photo";
import { uploadReel } from "./lib/actions/upload-reel";
import { instagramCommon } from "./lib/common";

export const instagramBusiness = createPiece({
    displayName: "Instagram for Business",
        minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/instagram.png",
    authors: ['MoShizzle'],
    auth: instagramCommon.authentication,
    actions: [uploadPhoto, uploadReel],
    triggers: [],
});
