import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend } from '../backend';

export const fetchKeys = createAction({
  name: 'fetch-keys',
  displayName: 'Get all keys',
  description: 'Returns list of all available keys',
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
  },
  async run({ propsValue: { backendUrl, apiKey } }) {
    const backend = new Backend(
      backendUrl,
      apiKey,
    );

    return backend.getKeys();
  },
});
