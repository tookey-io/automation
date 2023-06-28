import { createAction } from "@activepieces/pieces-framework"

import { instagramCommon, FacebookPageDropdown } from "../common"

export const uploadReel = createAction({
    name: 'upload_reel',
    displayName: 'Upload Reel',
    description: 'Upload a reel to an Instagram Professional Account',
    props: {
        authentication: instagramCommon.authentication,
        page: instagramCommon.page,
        video: instagramCommon.video,
        caption: instagramCommon.caption
    },
    sampleData: {},

    async run(context) {
        const page: FacebookPageDropdown = context.propsValue.page!
        
        const result = await instagramCommon.createVideoPost(page, context.propsValue.caption, context.propsValue.video)
        return result;
    }
});