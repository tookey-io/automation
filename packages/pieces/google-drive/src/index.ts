import { PieceAuth, createPiece } from '@activepieces/pieces-framework';

import { googleDriveCreateNewFolder } from './lib/action/create-new-folder';
import { googleDriveCreateNewTextFile } from './lib/action/create-new-text-file';
import { googleDriveUploadFile } from './lib/action/upload-file';
import { newFile } from './lib/triggers/new-file';
import { newFolder } from './lib/triggers/new-folder';
import { readFile } from './lib/action/read-file';
import { googleDriveListFiles } from './lib/action/list-files.action';
import { googleDriveSearchFolder } from './lib/action/search-folder.action';
import { duplicateFileAction } from './lib/action/duplicate-file.action';
import { saveFileAsPdf } from './lib/action/save-file-as-pdf.action';

export const googleDriveAuth = PieceAuth.OAuth2({
    description: "",
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    required: true,
    scope: ["https://www.googleapis.com/auth/drive"]
})

export const googleDrive = createPiece({
	minimumSupportedRelease: '0.5.6',
    logoUrl: 'https://cdn.activepieces.com/pieces/google-drive.png',
	displayName: "Google Drive",
	authors: ['kanarelo', 'BastienMe', 'MoShizzle', 'Armangiau', 'vitalini', 'PFernandez98'],
	triggers: [newFile, newFolder],
	actions: [googleDriveCreateNewFolder, googleDriveCreateNewTextFile, googleDriveUploadFile, readFile, googleDriveListFiles, googleDriveSearchFolder, duplicateFileAction, saveFileAsPdf],
    auth: googleDriveAuth,
});
