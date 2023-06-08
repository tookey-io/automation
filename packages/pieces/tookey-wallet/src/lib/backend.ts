import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { KeyListDto, SingInResponseDto, TokenDto } from './types';

enum AuthenticationMethod {
  None,
  RefreshToken,
  AccessToken,
}

export class Token {
  constructor(public token: string, public validUntil: Date) {}

  static empty() {
    return new Token('', new Date(0));
  }

  static fromDto(dto: TokenDto) {
    return new Token(dto.token, new Date(dto.validUntil));
  }

  toDto(): TokenDto {
    return {
      token: this.token,
      validUntil: this.validUntil.toISOString(),
    };
  }
}

export class Backend {
  constructor(
    private baseUrl: string,
    private refreshToken: Token,
    private accessToken: Token
  ) {}

  toDto(): SingInResponseDto {
    return {
      refresh: this.refreshToken.toDto(),
      access: this.accessToken.toDto(),
    };
  }

  static async fromDto(baseUrl: string, dto: SingInResponseDto) {
    return new Backend(
      baseUrl,
      Token.fromDto(dto.refresh),
      Token.fromDto(dto.access)
    );
  }

  static async fromOTP(baseUrl: string, otp: string) {
    const { body } = await httpClient.sendRequest<SingInResponseDto>({
      method: HttpMethod.POST,
      url: `${baseUrl}/api/auth/signin`,
      headers: {
        'X-SIGNIN-KEY': otp,
      },
    });

    return Backend.fromDto(baseUrl, body);
  }

  async getKeys() {
    return this.makeRequest<KeyListDto, {}>(
      '/api/keys',
      HttpMethod.GET,
      {},
      AuthenticationMethod.AccessToken
    );
  }

  async refreshAccessToken() {
    this.accessToken = Token.fromDto(
      await this.makeRequest(
        '/api/auth/refresh',
        HttpMethod.POST,
        {},
        AuthenticationMethod.RefreshToken
      )
    );

    return this.accessToken;
  }

  private async getAuthToken(authentication: AuthenticationMethod) {
    if (authentication === AuthenticationMethod.None) return 'None';

    if (this.refreshToken && this.refreshToken.validUntil > new Date()) {
      if (authentication === AuthenticationMethod.RefreshToken) {
        return this.refreshToken.token;
      } else {
        if (!this.accessToken || this.accessToken.validUntil < new Date()) {
          await this.refreshAccessToken();
        }

        return this.accessToken.token;
      }
    } else {
      throw new Error('Not authenticated, refresh token expired or undefined');
    }
  }

  private async makeRequest<
    TResponse extends Record<string, any>,
    TRequest extends Record<string, any>
  >(
    path: string,
    method: HttpMethod,
    body: TRequest,
    authentication: AuthenticationMethod
  ): Promise<TResponse> {
    const auth = authentication !== AuthenticationMethod.None;
    const authToken = await this.getAuthToken(authentication);

    const { body: response } = await httpClient.sendRequest<TResponse>({
      method,
      url: `${this.baseUrl}${path}`,
      body,
      headers: {
        Authorization: auth ? `Bearer ${authToken}` : undefined,
      },
    });

    return response;
  }
}
