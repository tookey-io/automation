import { PieceAuth, Property, createPiece } from "@activepieces/pieces-framework";
import { freshSalesCreateContact } from "./lib/actions/create-contact";

const markdownDescription = `
To obtain your API key and bundle alias, follow these steps:

1. Log in to your Freshsales account.
2. Click on your profile icon in the top-right corner of the screen and select **Settings** from the dropdown menu.
3. In the settings menu, select **API Settings** from the left-hand navigation panel.
4. You should now see your API key displayed on the screen. If you don't see an API key.
5. Copy the alias e.g **https://<alias>.myfreshworks.com**
`

export const freshsalesAuth = PieceAuth.BasicAuth({
  
  description: markdownDescription,
  username: Property.ShortText({
    displayName: "Bundle alias",
    description: "Your Freshsales bundle alias (e.g. https://<alias>.myfreshworks.com)",
    required: true
  }),
  password: Property.ShortText({
    displayName: "API Key",
    description: "The API Key supplied by Freshsales",
    required: true
  }),
  required: true
})

export const freshsales = createPiece({
  displayName: "Freshsales",
      minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/freshsales.png',
  authors: ['kanarelo'],
  auth: freshsalesAuth,
  actions: [freshSalesCreateContact],
  triggers: [],
});
