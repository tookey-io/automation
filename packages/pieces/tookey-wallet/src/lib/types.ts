export interface TokenDto {
  token: string;
  validUntil: string;
}

export interface SingInResponseDto {
    access: TokenDto;
    refresh: TokenDto;
}


export interface KeyDto {
  id: number;
  roomId: string;
  participantsThreshold: number;
  timeoutSeconds: number;
  name: string;
  description: string;
  tags: string[];
  participants: number[];
  publicKey: string;
}

export interface KeyListDto {
  items: KeyDto[];
}


export type EmptyRecord = Record<string, never>