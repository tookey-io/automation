
import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { createPost } from "./lib/actions/create-post.action";
import { createTopic } from "./lib/actions/create-topic.action";
import { changeUserTrustLevel } from "./lib/actions/change-trust-level.action";
import { addUsersToGroup } from "./lib/actions/add-users-to-group.action";
import { sendPrivateMessage } from "./lib/actions/send-private-message.action";

const markdownPropertyDescription = `
*Get your api Key: https://discourse.yourinstance.com/admin/api/keys
`;


export const discourseAuth = PieceAuth.CustomAuth({
  description: markdownPropertyDescription,
  required: true,
  props: {
    api_key: PieceAuth.SecretText({
      displayName: 'API Key',
      required: true
    }),
    api_username: Property.ShortText({
      displayName: 'API Username',
      required: true
    }),
    website_url: Property.ShortText({
      displayName: 'Website URL',
      required: true,
      description:
        'URL of the discourse url i.e https://discourse.yourinstance.com'
    })
  },
});

export const discourse = createPiece({
  displayName: "Discourse",
  auth: discourseAuth,
  minimumSupportedRelease: '0.9.0',
  logoUrl: "https://cdn.activepieces.com/pieces/discourse.png",
  authors: ["pfernandez98"],
  actions: [createPost, createTopic, changeUserTrustLevel, addUsersToGroup, sendPrivateMessage],
  triggers: [],
});
