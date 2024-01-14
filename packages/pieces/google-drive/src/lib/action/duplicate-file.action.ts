import { Property, createAction } from '@activepieces/pieces-framework';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { googleDriveAuth } from '../../index';

export const duplicateFileAction = createAction({
  displayName: 'Duplicate File',
  auth: googleDriveAuth,
  name: 'duplicate_file',
  description: 'Duplicate a file from Google Drive. Returns the new file ID.',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The ID of the file to duplicate',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'The name of the new file',
      required: true,
    }),
    folderId: Property.ShortText({
      displayName: 'Folder ID',
      description: 'The ID of the folder where the file will be duplicated',
      required: true,
    }),
  },
  async run(context) {
    const authClient = new OAuth2Client();
    authClient.setCredentials(context.auth);

    const fileId = context.propsValue.fileId;
    const nameForNewFile = context.propsValue.name;
    const parentFolderId = context.propsValue.folderId;

    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.copy({
      fileId,
      auth: authClient,
      requestBody: { name: nameForNewFile, parents: [parentFolderId] },
    });

    if (response.status !== 200) {
      console.error(response);
      throw new Error('Error duplicating file');
    }

    return response.data;
  },
});
