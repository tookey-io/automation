import { createAction, Property } from '@activepieces/pieces-framework';
import { Backend } from '../backend';
import { TookeyAuth } from '../../index';

export const fetchKeys = createAction({
  auth: TookeyAuth,
  name: 'fetch-keys',
  displayName: 'Get all keys',
  description: 'Returns list of all available keys',
  sampleData: {},
  props: {
  },
  async run({ auth }) {
    const backend = new Backend(
      auth.backendUrl,
      auth.token,
    );

    return backend.getKeys();
  },
});
