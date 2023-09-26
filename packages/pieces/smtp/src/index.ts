
import { PieceAuth, Property, createPiece } from '@activepieces/pieces-framework';
import { sendEmail } from './lib/actions/send-email';
import nodemailer from 'nodemailer';

export const smtpAuth = PieceAuth.CustomAuth({
  required: true,
  props: {
    host: Property.ShortText({
      displayName: 'Host',
      required: true,
    }),
    email: Property.ShortText({
      displayName: 'Email',
      required: true,
    }),
    password: PieceAuth.SecretText({
      displayName: 'Password',
      required: true,
    }),
    port: Property.ShortText({
      displayName: 'Port',
      required: true,
    }),
    TLS: Property.Checkbox({
      displayName: 'Use TLS',
      defaultValue: false,
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      const transporter = nodemailer.createTransport({
        host: auth.host,
        port: +auth.port,
        auth: {
          user: auth.email,
          pass: auth.password,
        },
        connectionTimeout: 5000, // 5 second timeout
        secure: auth.TLS,
      });
      return new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
          if (error) {
            resolve({ valid: false, error: JSON.stringify(error) });
          } else {
            resolve({ valid: true });
          }
        });
      });
    } catch (e) {
      return {
        valid: false,
        error: JSON.stringify(e)
      };
    }
  }
})

export const smtp = createPiece({
  displayName: 'SMTP',
  minimumSupportedRelease: '0.5.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/smtp.png',
  authors: [
    'abaza738'
  ],
  auth: smtpAuth,
  actions: [
    sendEmail,
  ],
  triggers: [
  ],
});
