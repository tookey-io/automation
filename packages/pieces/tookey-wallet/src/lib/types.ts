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
  
  export interface DeviceDto {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    revision: number;
    name: string;
    description: string;
    token: string;
  
  }
  
  
  export type EmptyRecord = Record<string, never>