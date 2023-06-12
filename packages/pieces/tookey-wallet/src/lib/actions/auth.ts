import {
    createAction,
    Property
} from '@activepieces/pieces-framework';
import { Backend } from '../backend';
  
  export const auth = createAction({
    name: 'auth',
    displayName: 'Auth with OTP',
    description:
      'Authenticate with One Time password',
    sampleData: {},
    props: {
      backendUrl: Property.ShortText({
        displayName: 'Backend URL',
        description: 'Tookey Backend URL (self-hosted url or keep default)',
        defaultValue: 'https://backend.apps-production.tookey.cloud',
        required: true,
      }),
      otp: Property.SecretText({
        displayName: 'OTP',
        description: 'One time password (obtain in bot with /auth command)',
        required: true,
      })
    },
    async run({ propsValue }) {
        const backend = await Backend.fromOTP(propsValue.backendUrl, propsValue.otp);
        return backend.toDto();
    },
  });
  