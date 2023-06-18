import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { endpoint, kizeoFormsCommon } from '../common';


export const pushData = createAction({
  name: 'push_data', // Must be a unique across the piece, this shouldn't be changed.
  displayName: 'Push Data',
  description: 'Push a data to a form',
  props: {
    // Properties to ask from the user, in this ask we will take number
    authentication: kizeoFormsCommon.authentication,
    formId: kizeoFormsCommon.formId,
    userId: kizeoFormsCommon.userId,
    fields: kizeoFormsCommon.fields
  },
  async run(context) {
    const { authentication: personalToken, formId, userId, fields } = context.propsValue;

    type Body = {
        recipient_user_id: string | undefined;
        fields: Record<string, { value: string }>;
    };

    const body: Body = {
        recipient_user_id: userId,
        fields: {}
    };

    for (let i = 0; i < Object.keys(fields).length; i++) {
        const fieldId = Object.keys(fields)[i];
        body.fields[fieldId] = { "value": fields[Object.keys(fields)[i]] };
    }

    const response = await httpClient.sendRequest<{ data: unknown }>({
      method: HttpMethod.POST,
      url: endpoint + `v3/forms/${formId}/push?used-with-actives-pieces=`,
      headers: {
            'Content-Type': 'application/json',
            'Authorization': personalToken,
        },
      body: body,
    })
    if (response.status === 200) {
      return response.body.data
    }

    return []
  },
});
