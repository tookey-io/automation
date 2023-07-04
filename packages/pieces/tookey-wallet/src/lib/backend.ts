import {
  httpClient,
  HttpMessageBody,
  HttpMethod,
} from '@activepieces/pieces-common';
import { DeviceDto, EmptyRecord, KeyListDto } from './types';

export class Backend {
  constructor(
    private baseUrl: string,
    private token: string,
  ) {
    if (this.baseUrl.endsWith('/'))
      this.baseUrl = this.baseUrl.slice(0, this.baseUrl.length - 1);
  }

  async getKeys() {
    return this.makeRequest<KeyListDto, EmptyRecord>(
      '/api/keys',
      HttpMethod.GET,
      {},
    );
  }

  async getDevicesForKey(key: string) {
    return this.makeRequest<DeviceDto[], EmptyRecord>(
      `/api/devices/key/${key}`,
      HttpMethod.GET,
      {},
    );
  }

  async initializeSign(publicKey: string, digest: string, externalSignerToken: string) {
    return this.makeRequest(
      '/v2/api/sign/init',
      HttpMethod.POST,
      {
        task: {
          publicKey,
          digest,
          // meta: {
          //   kind: 'ethereum-message',
          //   message: 'hello world',
          // }
          meta: {
            kind: 'ethereum-tx',
            to: '0x6b7a87899490EcE95443e979cA9485CBE7E71522',
            from: '0x2A038e100F8B85DF21e4d44121bdBfE0c288A869',
            value: '0x00',
            gasLimit: '0xffff',
            gasPrice: '0xffff',
            nonce: '0xffff',
            data: '0x0175b1c470eaaebe04568ab66989f94f5e1f2e396a9fd77111412ed50e80614596e64e500000000000000000000000007ea2be2df7ba6e54b1a9c70676f668455e329d29000000000000000000000000ddf213419be9c8ca854bd3d0a8ce4a1c77117aca000000000000000000000000000000000000000000000000000000042f4c51c0000000000000000000000000000000000000000000000000000000000000a4b1',
          }
        },
        externalSignerToken,
        // publicKey,
        // data,
        // participantsConfirmations: [1, 2],
        // metadata: {
        //   source: 'automation',
        // },
      }
    );
  }

  private async makeRequest<
    TResponse extends HttpMessageBody,
    TRequest extends HttpMessageBody
  >(
    path: string,
    method: HttpMethod,
    body: TRequest,
  ): Promise<TResponse> {
    const { body: response } = await httpClient.sendRequest<TResponse>({
      method,
      url: `${this.baseUrl}${path}`,
      body,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return response;
  }
}
