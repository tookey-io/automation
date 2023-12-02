import { OperatorFunction, catchError, of } from 'rxjs';
import { PieceMetadataModel } from '@activepieces/ui/common';
import { AppConnectionType } from '@activepieces/shared';

export type PieceOAuth2DetailsMap = {
  [pieceName: string]: {
    clientId: string;
    connectionType:
      | AppConnectionType.CLOUD_OAUTH2
      | AppConnectionType.PLATFORM_OAUTH2;
  };
};
export type PieceOAuth2DetailsValue = {
  clientId: string;
  connectionType:
    | AppConnectionType.CLOUD_OAUTH2
    | AppConnectionType.PLATFORM_OAUTH2;
};
export const handleErrorForGettingPiecesOAuth2Details: OperatorFunction<
  PieceOAuth2DetailsMap,
  PieceOAuth2DetailsMap
> = catchError((err) => {
  console.error(err);
  return of({} as PieceOAuth2DetailsMap);
});

export function checkIfTriggerIsAppWebhook(
  metaData: PieceMetadataModel,
  triggerName: string
) {
  let isTriggerAppWebhook = false;
  Object.keys(metaData.triggers).forEach((k) => {
    isTriggerAppWebhook =
      isTriggerAppWebhook ||
      (triggerName === k && metaData.triggers[k].type === 'APP_WEBHOOK');
  });
  return isTriggerAppWebhook;
}

export function getConnectionNameFromInterpolatedString(
  interpolatedString: string
) {
  //eg. {{connections.google}}
  if (interpolatedString.includes('[')) {
    const result = interpolatedString.substring(`{{connections['`.length);
    return result.slice(0, result.length - 4);
  }
  const result = interpolatedString.substring(`{{connections.`.length);
  return result.slice(0, result.length - 4);
}
