
import { ActionContext, createAction, createPiece, PieceAuth, PieceAuthProperty, Property } from "@activepieces/pieces-framework";
import { httpClient, HttpMethod} from '@activepieces/pieces-common'

type CreateOrderRequest = {
  files: Array<{
    size: string | number,
    url: string,
    name: string
  }>,
  receiveAddress?: string,
  fee?: string | number,
  lowPostage?: boolean
}

const CreateOrder = createAction({
  auth: PieceAuth.None(),
  requireAuth: false,
  displayName: 'Create Order',
  name: 'create_order',
  description: 'Create an order to inscribe ordinals NTF in Bitcoin blockchain',
  props: {
    size: Property.Number({
      description: 'Size of image',
      displayName: "Size",
      required: true
    }),
    url: Property.ShortText({
      description: 'URL of image',
      displayName: "URL",
      required: true
    }),
    lowPostage: Property.Checkbox({
      description: 'Low postage',
      displayName: "Low Postage",
      required: false
    }),
    fee: Property.Number({
      description: 'Fee of order',
      displayName: "Fee",
      required: false
    }),
    receiveAddress: Property.ShortText({
      description: 'Receive address',
      displayName: "Receive Address",
      required: false
    }),
    name: Property.ShortText({
      description: 'File name including extension',
      displayName: "File Name",
      required: true
    }),
  },
  run: async ({ propsValue: { size, url, name, receiveAddress, fee, lowPostage  }}) => {
    return httpClient.sendRequest<CreateOrderRequest>({
      url: `https://api.ordinalsbot.com/order`,
      method: HttpMethod.POST,
      body: {
        files: [
          {
            size,
            url,
            name
          }
        ],
        receiveAddress,
        fee,
        lowPostage
      }
    })
  }
})

export const Ordinalsbot = createPiece({
  displayName: "Ordinalsbot",
  description: "Ordinalsbot is a bot that can be used to fetch ordinals and create in Bitcoin blockchain",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.8.0',
  logoUrl: "https://raw.githubusercontent.com/tookey-io/icons/main/piece-ordinalsbot.png",
  authors: [],
  actions: [CreateOrder],
  triggers: [],
});
