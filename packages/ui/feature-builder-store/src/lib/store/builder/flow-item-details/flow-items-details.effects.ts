import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, map, of, switchMap, take } from 'rxjs';
import { ActionType, TriggerType } from '@activepieces/shared';
import { FlowItemDetailsActions } from './flow-items-details.action';
import {
  PieceMetadataService,
  CORE_PIECES_ACTIONS_NAMES,
  CORE_PIECES_TRIGGERS,
  FlowItemDetails,
} from '@activepieces/ui/common';
import { PieceMetadataSummary } from '@activepieces/pieces-framework';

@Injectable()
export class FlowItemsDetailsEffects {
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowItemDetailsActions.loadFlowItemsDetails),
      switchMap(() => {
        const pieces$ = this.flowItemsDetailsService
          .getPiecesManifest()
          .pipe(take(1));
        const coreTriggersFlowItemsDetails$ = of(
          this.flowItemsDetailsService.triggerItemsDetails
        );
        const customPiecesTriggersFlowItemDetails$ = pieces$.pipe(
          map(this.createFlowItemDetailsForComponents(true))
        );
        const customPiecesActions$ = pieces$.pipe(
          map(this.createFlowItemDetailsForComponents(false))
        );
        const coreFlowItemsDetails$ = of(
          this.flowItemsDetailsService.coreFlowItemsDetails
        );
        return forkJoin({
          coreFlowItemsDetails: coreFlowItemsDetails$,
          coreTriggerFlowItemsDetails: coreTriggersFlowItemsDetails$,
          customPiecesActionsFlowItemDetails: customPiecesActions$,
          customPiecesTriggersFlowItemDetails:
            customPiecesTriggersFlowItemDetails$,
        });
      }),
      map((res) => {
        res.coreFlowItemsDetails = this.moveCorePiecesToCoreFlowItemDetails(
          CORE_PIECES_ACTIONS_NAMES,
          res.customPiecesActionsFlowItemDetails,
          res.coreFlowItemsDetails
        );
        res.coreTriggerFlowItemsDetails =
          this.moveCorePiecesToCoreFlowItemDetails(
            CORE_PIECES_TRIGGERS,
            res.customPiecesTriggersFlowItemDetails,
            res.coreTriggerFlowItemsDetails
          );
        return res;
      }),
      switchMap((res) => {
        return of(
          FlowItemDetailsActions.flowItemsDetailsLoadedSuccessfully({
            flowItemsDetailsLoaded: { ...res, loaded: true },
          })
        );
      })
    );
  });

  private moveCorePiecesToCoreFlowItemDetails(
    piecesNamesToMove: string[],
    source: FlowItemDetails[],
    target: FlowItemDetails[]
  ) {
    const indicesOfPiecesInSource = piecesNamesToMove
      .map((n) => {
        const index = source.findIndex((p) => p.extra?.appName === n);

        if (index < 0) {
          console.warn(`piece ${n} is not found`);
        }
        return index;
      })
      .filter((idx) => idx > -1);
    indicesOfPiecesInSource.forEach((idx) => {
      target = [...target, { ...source[idx] }];
    });
    piecesNamesToMove.forEach((pieceName) => {
      const index = source.findIndex((p) => p.extra?.appName === pieceName);
      // Remove the piece from the source if it is found
      if (index > 0) {
        source.splice(index, 1);
      }
    });
    return target.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  createFlowItemDetailsForComponents(forTriggers: boolean) {
    return (piecesManifest: PieceMetadataSummary[]) => {
      return piecesManifest
        .map((piece) => {
          if (piece.actions > 0 && !forTriggers) {
            return new FlowItemDetails(
              ActionType.PIECE,
              piece.displayName,
              piece.description ? piece.description : ``,
              piece.tags,
              piece.logoUrl,
              {
                appName: piece.name,
                appVersion: piece.version,
              }
            );
          } else if (piece.triggers > 0 && forTriggers) {
            return new FlowItemDetails(
              TriggerType.PIECE,
              piece.displayName,
              piece.description ? piece.description : ``,
              piece.tags,
              piece.logoUrl,
              {
                appName: piece.name,
                appVersion: piece.version,
              }
            );
          } else {
            return null;
          }
        })
        .filter((res) => res !== null) as FlowItemDetails[];
    };
  }
  constructor(
    private actions$: Actions,
    private flowItemsDetailsService: PieceMetadataService
  ) {}
}
