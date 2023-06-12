import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend, Token } from '../backend';

export const signRequest = createAction({
  name: 'sign-request',
  displayName: 'Sign Hash Request',
  description:
    'Send request on signing hex encoded hash string (will fire autherization flow or check previous autherization)',
  sampleData: {},
  props: {
    backendUrl: Property.ShortText({
      displayName: 'Backend URL',
      description: 'Tookey Backend URL (self-hosted url or keep default)',
      defaultValue: 'https://backend.apps-production.tookey.cloud',
      required: true,
    }),
    apiKey: Property.SecretText({
      displayName: 'Api Key',
      description: 'Tookey API Key',
      required: true,
    }),
    hash: Property.ShortText({
      displayName: 'Digest',
      description: 'Hex encoded 256 bit digest of signing message',
      required: true,
    }),
    wallet: Property.Dropdown<string, true>({
      displayName: 'Wallet',
      description: 'Wallet to sign hash',
      required: true,
      defaultValue: '0x',
      refreshers: ['apiKey', 'backendUrl'],
      async options({ apiKey, backendUrl }) {
        if (typeof backendUrl !== 'string')
          return {
            disabled: true,
            options: [],
          };
        if (typeof apiKey !== 'string')
          return {
            disabled: true,
            options: [],
          };

        try {
          const backend = new Backend(
            backendUrl,
            new Token(apiKey, new Date(new Date().getTime() + 86400000)),
            Token.empty()
          );

          return {
            disabled: false,
            options: await backend.getKeys().then((keys) =>
              keys.items.map((key) => ({
                value: key.publicKey,
                label: key.name,
              }))
            ),
          };
        } catch {
          return {
            disabled: true,
            options: [],
          };
        }
      },
    }),
  },
  async run({ propsValue }) {
    const backend = new Backend(
      propsValue.backendUrl,
      new Token(propsValue.apiKey, new Date(new Date().getTime() + 86400000)),
      Token.empty()
    );

    return backend.sign(propsValue.wallet, propsValue.hash);
  },
});
