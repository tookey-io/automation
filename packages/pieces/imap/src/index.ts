import { PieceAuth, Property, createPiece } from "@activepieces/pieces-framework";
import imap from 'imap';
import { newEmail } from "./lib/triggers/new-email";
import { imapCommon } from "./lib/common";

const description = `
**Gmail Users:**
<br><br>
Make Sure of the following:
<br>
* IMAP is enabled in your Gmail settings (https://support.google.com/mail/answer/7126229?hl=en)
* You have created an App Password to login with (https://support.google.com/accounts/answer/185833?hl=en)
* Enable TLS and set the port to 993 and the host to imap.gmail.com
`
export const imapAuth = PieceAuth.CustomAuth({
    description: description,
    props: {
        host: Property.ShortText({
            displayName: 'Host',
            required: true,
        }),
        username: Property.ShortText({
            displayName: 'Username',
            required: true,
        }),
        password: PieceAuth.SecretText({
            displayName: 'Password',
            required: true,
        }),
        port: Property.Number({
            displayName: 'Port',
            required: true,
            defaultValue: 143,
        }),
        tls: Property.Checkbox({
            displayName: 'Use TLS',
            defaultValue: false,
            required: true,
        }),
    },
    validate: async ({ auth }) => {
        try {
            const imapClient = new imap(imapCommon.constructConfig(auth));
            return new Promise((resolve, reject) => {
                imapClient.once('error', function (err: any) {
                    resolve({ valid: false, error: JSON.stringify(err) });
                });
                imapClient.once('ready', function () {
                    resolve({ valid: true });
                    imapClient.end();
                });
                imapClient.once('end', function () {
                    imapClient.end();
                });
                imapClient.connect();
            });
        } catch (e) {
            return {
                valid: false,
                error: JSON.stringify(e)
            };
        }
    },
    required: true
})

export const imapPiece = createPiece({
    displayName: "IMAP",
    minimumSupportedRelease: '0.5.0',
    logoUrl: "https://cdn.activepieces.com/pieces/imap.png",
    authors: ['MoShizzle'],
    auth: imapAuth,
    actions: [],
    triggers: [newEmail],
});
