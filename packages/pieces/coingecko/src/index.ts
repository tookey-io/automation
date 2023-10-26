
import { createAction, createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import Coins from "./coins.json"
import { httpClient, HttpMethod } from '@activepieces/pieces-common'

export const CoinGeckoAuth = PieceAuth.SecretText({
  required: false,
  displayName: 'API Key',
  description: 'API Key from CoinGecko',
})

const CoinPrice = createAction({
  requireAuth: false,
  auth: CoinGeckoAuth,
  name: "coin_price",
  displayName: "Fetch Coin Price",
  description: "Fetches coin price from CoinGecko",
  props: {
    token: Property.StaticDropdown({
      displayName: 'Token',
      required: true,
      options: {
        disabled: false,
        options: Coins.map(({id, name, symbol }) => ({ value: id, label: `[${symbol}] ${name}`}))
      }
    })
  },
  async run(ctx) {
    return httpClient.sendRequest({
      url: `https://api.coingecko.com/api/v3/simple/price?ids=${ctx.propsValue.token}&vs_currencies=usd`,
      method: HttpMethod.GET,
    })
  }
})

export const coingecko = createPiece({
  displayName: "Coingecko",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.9.0',
  logoUrl: 'https://raw.githubusercontent.com/tookey-io/icons/main/piece-coingecko.png',
  authors: ["Aler Denisov"],
  actions: [CoinPrice],
  triggers: [],
});
