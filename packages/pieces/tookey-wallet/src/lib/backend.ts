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
  
    async initializeSign(publicKey: string, digest: string, externalSignerToken: string, meta: Record<string, any>) {
      return this.makeRequest(
        '/v2/api/sign/init',
        HttpMethod.POST,
        {
          task: {
            publicKey,
            digest,
            meta,
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
  