import { createAction, Property, OAuth2PropertyValue } from "@activepieces/pieces-framework";
import { httpClient, HttpMethod, AuthenticationType, HttpRequest } from "@activepieces/pieces-common";
import { googleDriveAuth } from "../../";

export const googleDriveCreateNewFolder = createAction({
  auth: googleDriveAuth,
    name: 'create_new_gdrive_folder',
    description: 'Create a new empty folder in your Google Drive',
    displayName: 'Create new folder',
    props: {
      folderName: Property.ShortText({
        displayName: 'Folder name',
        description: 'The name of the new folder',
        required: true,
      }),
      parentFolder: Property.Dropdown({
        displayName: "Parent Folder",
        required: false,
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
          const folders = (await httpClient.sendRequest<{ files: { id: string, name: string }[] }>({
            method: HttpMethod.GET,
            url: `https://www.googleapis.com/drive/v3/files`,
            queryParams: {
              q: "mimeType='application/vnd.google-apps.folder'"
            },
            authentication: {
              type: AuthenticationType.BEARER_TOKEN,
              token: authProp['access_token'],
            }
          })).body.files;

          return {
            disabled: false,
            options: folders.map((sheet: { id: string, name: string }) => {
              return {
                label: sheet.name,
                value: sheet.id
              }
            })
          };
        }
      }),
    },
    async run(context) {
      const body: Record<string, (string | string[] | undefined)> = {
        'mimeType': "application/vnd.google-apps.folder",
        'name': context.propsValue.folderName,
        ...(context.propsValue.parentFolder ? { 'parents': [context.propsValue.parentFolder] } : {})
      }

      const request: HttpRequest<Record<string, unknown>> = {
        method: HttpMethod.POST,
        url: `https://www.googleapis.com/drive/v3/files`,
        body: body,
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: context.auth.access_token,
        }
      }

      const result = await httpClient.sendRequest(request)
      console.debug("Folder creation response", result)

      if (result.status == 200) {
        return result.body;
      } else {
        return result;
      }
    }
});
