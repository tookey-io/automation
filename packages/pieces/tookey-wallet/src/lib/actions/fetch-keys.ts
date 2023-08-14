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
  },
  async run({ auth, propsValue: { backendUrl } }) {
    const backend = new Backend(
      backendUrl,
      auth as string,
    );

    return backend.getKeys();
  },
});
