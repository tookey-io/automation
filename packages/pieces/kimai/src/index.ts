
import { createPiece, PieceAuth, Property, Validators } from "@activepieces/pieces-framework";
import { kimaiCreateTimesheetAction } from "./lib/actions/create-timesheet";
import { makeClient } from "./lib/common";
import { HttpError } from "@activepieces/pieces-common";

export const kimaiAuth = PieceAuth.CustomAuth({
  description: `
  To configure API access:

  1. Go to Kimai Web UI;
  2. Click on your user profile and then go to "API Access";
  3. Configure an API password (different from user password).
  `,
  props: {
    base_url: Property.ShortText({
      displayName: 'Server URL',
      description: 'Kimai Instance URL (e.g. https://demo.kimai.org)',
      validators: [Validators.url],
      required: true
    }),
    user: Property.ShortText({
      displayName: 'Username',
      description: 'Kimai Username/Email',
      required: true,
    }),
    api_password: PieceAuth.SecretText({
      displayName: 'API Password',
      description: 'Kimai API Password',
      required: true,
    })
  },
  validate: async ({ auth }) => {
    if (!auth) {
      return {
        valid: false,
        error: 'Configuration missing!'
      };
    }

    const client = await makeClient(auth);

    try {
      const pingResponse = await client.ping();
      if (pingResponse.message !== 'pong') {
        return {
          valid: false,
          error: pingResponse.message
        };
      }

      return {
        valid: true
      };

    } catch (e) {
      if (e instanceof HttpError) {
        if (e.response.body instanceof Object && 'message' in e.response.body) {
          return {
            valid: false,
            error: e.response.body.message as string
          };
        }
      }

      return {
        valid: false,
        error: 'Please check your server URL/credentials and try again.'
      };
    }
  },
  required: true
})

export const kimai = createPiece({
  displayName: "Kimai",
  auth: kimaiAuth,
  minimumSupportedRelease: '0.6.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/kimai.png',
  authors: ['facferreira'],
  actions: [kimaiCreateTimesheetAction],
  triggers: [],
});
