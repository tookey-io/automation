import {
  ActionType,
  PackageType,
  PieceType,
  TriggerType,
} from '@activepieces/shared';

export class FlowItemDetails {
  constructor(
    public type: ActionType | TriggerType,
    public name: string,
    public description: string,
    public tags: string[],
    public logoUrl?: string,
    public extra?: {
      packageType: PackageType;
      pieceType: PieceType;
      pieceName: string;
      pieceVersion: string;
    }
  ) {}
}
