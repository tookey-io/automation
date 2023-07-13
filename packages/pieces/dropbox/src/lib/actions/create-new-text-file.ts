import { createAction, Property} from "@activepieces/pieces-framework"
import { HttpRequest, HttpMethod, AuthenticationType, httpClient } from "@activepieces/pieces-common"
import { dropboxAuth } from "../../"

export const dropboxCreateNewTextFile = createAction({
  auth: dropboxAuth,
    name: 'create_new_dropbox_text_file',
    description: 'Create a new text file in your Dropbox from text input',
    displayName: 'Create New Text File',
    props: {
      path: Property.ShortText({
        displayName: 'Path',
        description: 'The path of the new folder e.g. /Homework/math',
        required: true
      }),
      text: Property.LongText({
        displayName: 'Text',
        description: "The text to write into the file.",
        required: true
      }),
      autorename: Property.Checkbox({
        displayName: 'Autorename',
        description: "If there's a conflict, have the Dropbox server try to autorename the folder to avoid the conflict. The default for this field is False.",
        required: false
      }),
      mute: Property.Checkbox({
        displayName: 'Mute',
        description: "Normally, users are made aware of any file modifications in their Dropbox account via notifications in the client software. If true, this tells the clients that this modification shouldn't result in a user notification.",
        required: false
      }),
      strict_conflict: Property.Checkbox({
        displayName: 'Strict conflict',
        description: 'Be more strict about how each WriteMode detects conflict. For example, always return a conflict error when mode = WriteMode.update and the given "rev" doesn\'t match the existing file\'s "rev", even if the existing file has been deleted.',
        required: false
      }),
    },
    sampleData: {
      "client_modified": "2015-05-12T15:50:38Z",
      "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "file_lock_info": {
        "created": "2015-05-12T15:50:38Z",
        "is_lockholder": true,
        "lockholder_name": "Imaginary User"
      },
      "has_explicit_shared_members": false,
      "id": "id:a4ayc_80_OEAAAAAAAAAXw",
      "is_downloadable": true,
      "name": "Prime_Numbers.txt",
      "path_display": "/Homework/math/Prime_Numbers.txt",
      "path_lower": "/homework/math/prime_numbers.txt",
      "property_groups": [
        {
          "fields": [
            {
              "name": "Security Policy",
              "value": "Confidential"
            }
          ],
          "template_id": "ptid:1a5n2i6d3OYEAAAAAAAAAYa"
        }
      ],
      "rev": "a1c10ce0dd78",
      "server_modified": "2015-05-12T15:50:38Z",
      "sharing_info": {
        "modified_by": "dbid:AAH4f99T0taONIb-OurWxbNQ6ywGRopQngc",
        "parent_shared_folder_id": "84528192421",
        "read_only": true
      },
      "size": 7212
    },
    async run(context) {
      const params = {
        autorename: context.propsValue.autorename,
        path: context.propsValue.path,
        mode: "add",
        mute: context.propsValue.mute,
        strict_conflict: context.propsValue.strict_conflict
      }

      const request: HttpRequest = {
        method: HttpMethod.POST,
        url: `https://content.dropboxapi.com/2/files/upload`,
        body: Buffer.from(context.propsValue.text, 'utf-8'),
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: context.auth.access_token,
        },
        headers: {
          "Dropbox-API-Arg": JSON.stringify(params),
          "Content-Type": "application/octet-stream"
        }
      }

      const result = await httpClient.sendRequest(request)
      console.debug("Folder creation response", result)

      if (result.status == 200) {
        return result.body
      } else {
        return result
      }
    },
})
