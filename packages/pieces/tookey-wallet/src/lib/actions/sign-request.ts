import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend } from '../backend';

export const signRequest = createAction({
  name: 'sign-request',
  displayName: 'Sign Request',
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
            options: [
              { label: 'Provide backend url', value: 'error' }
            ],
          };
        if (typeof apiKey !== 'string')
          return {
            disabled: true,
            options: [
              { label: 'Provide apiKey', value: 'error' }
            ],
          };

        try {
          const backend = new Backend(
            backendUrl,
            apiKey,
          );

          return {
            disabled: false,
            options: await backend.getKeys().then((keys) =>
              keys.items.map((key) => ({
                value: key.publicKey,
                label: `${key.name} ${key.publicKey} ${key.id}`,
              }))
            ),
          };
        } catch(e: any) {
          return {
            disabled: true,
            options: [
              { label: e.toString(), value: 'error' }
            ],
          };
        }
      },
    }),
    signer: Property.Dropdown<string, true>({
      displayName: 'Signer',
      description: 'Signer instance',
      required: true,
      defaultValue: '...',
      refreshers: ['apiKey', 'backendUrl', 'wallet'],
      async options({ apiKey, backendUrl, wallet }) {
        if (typeof backendUrl !== 'string')
          return {
            disabled: true,
            options: [
              { label: 'Provide backend url', value: 'error' }
            ],
          };
        if (typeof apiKey !== 'string')
          return {
            disabled: true,
            options: [
              { label: 'Provide apiKey', value: 'error' }
            ],
          };
        if (typeof wallet !== 'string')
            return {
              disabled: true,
              options: [
                { label: 'Select a wallet', value: 'error' }
              ],
            };

        try {
          const backend = new Backend(
            backendUrl,
            apiKey,
          );

          return {
            disabled: false,
            options: await backend.getDevicesForKey(wallet).then((devices) => {
              console.log('devices of ', wallet, devices);
              return devices.map(d => ({
                label: `${d.name} ${d.description}`,
                value: d.token,
              }))
            }),  
          };
        } catch(e: any) {
          return {
            disabled: true,
            options: [
              { label: e.toString(), value: 'error' }
            ],
          };
        }
      },
    }),
  },
  async run({ propsValue }) {
    const backend = new Backend(
      propsValue.backendUrl,
      propsValue.apiKey,
    );

    return backend.initializeSign(propsValue.wallet, propsValue.hash, propsValue.signer);
  },
});
