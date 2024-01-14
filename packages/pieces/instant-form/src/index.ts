import FormData from "form-data";
import { AuthenticationType, httpClient, HttpMethod } from "@activepieces/pieces-common";
import { ActionContext, createAction, createPiece, createTrigger, OAuth2Property, OAuth2PropertyValue, OAuth2Props, PieceAuth, PieceAuthProperty, Property, StaticPropsValue, Store, TestOrRunHookContext, TriggerStrategy } from "@activepieces/pieces-framework";
import { TriggerPayload } from "@activepieces/shared";

const catchQuery = new URLSearchParams({
  appName: "InstantForm",
  appIcon: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-instant-form.png",
  url: "https://t.me/InstantFormsBot/oauth?startapp={{client_id}}"
});

export const InstantFormAuth = PieceAuth.OAuth2({
  required: true,
  authUrl: `{{window.location.origin}}/catch_code?${catchQuery.toString()}`,
  tokenUrl: 'https://instantlyform.com/webBot/oauth/token',
  scope: [
    'all'
  ]
})

export const instantFormGetAllForms = createAction({
  name: "get_all_forms",
  displayName: "Get All Forms",
  description: "",
  props: {},
  auth: InstantFormAuth,
  requireAuth: true,
  async run(ctx) {
    return httpClient.sendRequest({
      method: HttpMethod.GET,
      url: "https://instantlyform.com/api/form",
      headers: {
        Authorization: `Bearer ${ctx.auth.access_token}`
      }
    }).then(r => r.body)
  }
})

export const instantFormNewResponse = createTrigger({
  name: "new_response",
  displayName: "New Response",
  description: "",
  props: {
    formId: Property.Dropdown({
      displayName: "Form ID",
        required: true,
        refreshers: [],
        options: async ({ auth }) => {
            if (!auth) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: 'Please authenticate first'
                }
            }
            const authProp: OAuth2PropertyValue = auth as OAuth2PropertyValue;
            const forms = await httpClient.sendRequest<{ data: Array<{ id: string, name: string }> }>({
                method: HttpMethod.GET,
                url: `https://instantlyform.com/api/form`,
                headers: {
                  Authorization: `Bearer ${authProp.access_token}`
                }
            }).then(r => r.body.data)

            return {
                disabled: false,
                options: forms.map((form: { id: string, name: string }) => {
                    return {
                        label: form.name,
                        value: form.id
                    }
                })
            };
        }
    })
  },
  auth: InstantFormAuth,
  type: TriggerStrategy.WEBHOOK,
  async onEnable(ctx) {
    const id = await httpClient.sendRequest<{ data: {id: string } }>({
      method: HttpMethod.POST,
      url: `https://instantlyform.com/api/form/${ctx.propsValue.formId}/webhook`,
      headers: {
        Authorization: `Bearer ${ctx.auth.access_token}`,
      },
      body: {
        url: ctx.webhookUrl
      }
    }).then(r => r.body.data.id)

    await ctx.store.put('__webhook_id', id);
  },
  async onDisable(ctx) {
    const id = await ctx.store.get('__webhook_id');
    if (id) {
      await httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `https://instantlyform.com/api/webhook/${id}`,
        headers: {
          Authorization: `Bearer ${ctx.auth.access_token}`
        }
      })
    }
  },

  async run(ctx) {
      const payloadBody = ctx.payload.body as Record<string, unknown>;
      if ('event_type' in payloadBody && payloadBody["event_type"] === "PING") {
        return [];
      }
      return [payloadBody];
  },
  sampleData: {}
})

export const instantForm = createPiece({
  displayName: "InstantForm",
  auth: InstantFormAuth,
  minimumSupportedRelease: '0.9.0',
  logoUrl:
      'https://raw.githubusercontent.com/tookey-io/icons/main/piece-instant-form.png',
  authors: [],
  actions: [instantFormGetAllForms],
  triggers: [instantFormNewResponse],
});
