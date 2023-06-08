import {
  createAction,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { KeyListDto, TokenDto } from '../types';
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
    wallet: Property.Dropdown({
      displayName: 'Wallet',
      description: 'Wallet to sign hash',
      required: true,
      defaultValue: '0x',
      refreshers: ['apiKey', 'backendUrl'],
      async options({ apiKey, backendUrl }) {
        if (typeof backendUrl !== 'string')
          return {
            disabled: false,
            options: [
              {
                value: '0x',
                label: 'Backend url is not valid',
              },
            ],
          };
        if (typeof apiKey !== 'string')
          return {
            disabled: false,
            options: [
              {
                value: '0x',
                label: 'Apikey is not valid',
              },
            ],
          };

        try {
          const backend = new Backend(
            backendUrl,
            new Token(apiKey, new Date(new Date().getTime() + 86400000)),
            Token.empty()
          );

          return {
            disabled: false,
            options: [
              ...(await backend.getKeys().then((keys) =>
                keys.items.map((key) => ({
                  value: key.publicKey,
                  label: key.name,
                }))
              )),
              {
                value: '0x',
                label: backendUrl,
              },
              {
                value: '0x2',
                label: apiKey,
              },
            ],
          };
        } catch (e: any) {
          return {
            disabled: false,
            options: [
              {
                value: '0x',
                label: e.toString(),
              },
            ],
          };
        }
      },
    }),
  },
  async run({ propsValue }) {
    return {};
  },
});
