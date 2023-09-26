import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { createCard } from './lib/actions/create-card';
import { getCard } from './lib/actions/get-card';
import { cardMovedTrigger } from './lib/triggers/cardMoved';
import { newCardTrigger } from './lib/triggers/newCard';
import { HttpMethod, HttpRequest, httpClient } from '@activepieces/pieces-common';

const markdownProperty = `
To obtain your API key and token, follow these steps:

1. Go to https://trello.com/app-key
2. Copy **Personal Key** and enter it into the Trello API Key connection
3. Click **generate a Token** in trello
4. Copy the token and paste it into the Trello Token connection
5. Your connection should now work!
`;
export const trelloAuth = PieceAuth.BasicAuth({
  description: markdownProperty,
  required: true,
  username: {
    displayName: 'API Key',
    description: 'Trello API Key'
  },
  password: {
    displayName: 'Token',
    description: 'Trello Token'
  },
  validate: async ({ auth }) => {
    const { username, password } = auth;
    if( !username || !password ) {
      return {
        valid: false,
        error: 'Empty API Key or Token'
      }
    }
    try {
      const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `https://api.trello.com/1/members/me/boards`
            + `?key=` + username
            + `&token=` + password
      };
      await httpClient.sendRequest(request);
      return {
        valid: true,
      }
    } catch (e) {
      return {
        valid: false,
        error: 'Invalid API Key or Token',
      }
    }
  }
});

export const trello = createPiece({
  displayName: 'Trello',
  minimumSupportedRelease: '0.5.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/trello.png',
  authors: ['ShayPunter','Salem-Alaa'],
  auth: trelloAuth,
  actions: [createCard, getCard],
  triggers: [cardMovedTrigger,newCardTrigger]
});
