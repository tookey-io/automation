import {
  PieceAuth,
  PiecePropValueSchema,
  Property,
  createPiece
} from '@activepieces/pieces-framework';
import { createWordpressPost } from './lib/actions/create-post.action';
import { wordpressNewPost } from './lib/trigger/new-post.trigger';
import { createWordpressPage } from './lib/actions/create-page.action';
import { AuthenticationType, HttpMethod, HttpRequest, httpClient } from '@activepieces/pieces-common';
import { wordpressCommon } from './lib/common';

const markdownPropertyDescription = `
**Enable Basic Authentication:**

1. Download the plugin from: https://github.com/WP-API/Basic-Auth (Click on Code -> Download Zip)
2. Log in to your Wordpress dashboard.
3. Go to "Plugins" and click "Add New."
4. Choose "Upload Plugin" and select the downloaded file.
5. Install and activate the plugin.

`;

export const wordpressAuth = PieceAuth.CustomAuth({
  description: markdownPropertyDescription,
  required: true,
  props: {
    username: Property.ShortText({
      displayName: 'Username',
      required: true
    }),
    password: PieceAuth.SecretText({
      displayName: 'Password',
      required: true
    }),
    website_url: Property.ShortText({
      displayName: 'Website URL',
      required: true,
      description:
        'URL of the wordpress url i.e https://www.example-website.com'
    })
  },
  validate: async ({ auth }) => {
    const { username, password, website_url } = auth;
    if (!username || !password || !website_url) {
      return {
        valid: false,
        error: 'please fill all the fields [username, password, website_url] ',
      }
    }
    if (!wordpressCommon.isBaseUrl(website_url.trim())) {
      return {
        valid: false,
        error: "Please ensure that the website is valid and does not contain any paths, for example, https://example-website.com.",
      }
    }
    const apiEnabled = await wordpressCommon.urlExists(website_url.trim() + '/wp-json');
    if(!apiEnabled) {
        return {
            valid: false,
            error: `REST API is not reachable, visit ${website_url.trim()}/wp-json" \n make sure your settings (Settings -> Permalinks) are set to "Post name" (or any option other than "Plain") and disable any security plugins that might block the REST API `,
        };
    }
    try {
      const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `${website_url}/wp-json/wp/v2/categories`,
        authentication: {
          type: AuthenticationType.BASIC,
          username: username,
          password: password
        },
      };
      await httpClient.sendRequest(request);
      return {
        valid: true,
      }
    } catch (e: any) {
      return {
        valid: false,
        error: "Credentials are invalid. " + e?.message,
      }
    }
  }
});

export const wordpress = createPiece({
  displayName: 'Wordpress',
  minimumSupportedRelease: '0.5.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/wordpress.png',
  auth: wordpressAuth,
  actions: [createWordpressPost, createWordpressPage],
  triggers: [wordpressNewPost]
});
