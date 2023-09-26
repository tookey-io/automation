import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  delay,
  EMPTY,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import {
  FlowsActions,
  FlowsActionType,
  SingleFlowModifyingState,
} from './flows.action';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuilderSelectors } from '../builder/builder.selector';
import { UUID } from 'angular2-uuid';
import { BuilderActions } from '../builder/builder.action';
import {
  ActionType,
  Flow,
  FlowOperationRequest,
  FlowOperationType,
  TriggerType,
  flowHelper,
} from '@activepieces/shared';
import { RightSideBarType } from '../../model/enums/right-side-bar-type.enum';
import { LeftSideBarType } from '../../model/enums/left-side-bar-type.enum';
import { NO_PROPS } from '../../model/canvas-state';
import { CollectionBuilderService } from '../../service/collection-builder.service';
import {
  BuilderAutocompleteMentionsDropdownService,
  FlowService,
  environment,
} from '@activepieces/ui/common';
import { canvasActions } from '../builder/canvas/canvas.action';
import { ViewModeActions } from '../builder/viewmode/view-mode.action';
import { ViewModeEnum } from '../../model';
import { FlowStructureUtil } from '../../utils/flowStructureUtil';
@Injectable()
export class FlowsEffects {
  loadInitial$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BuilderActions.loadInitial),
      switchMap(({ flow, run, folder }) => {
        return of(FlowsActions.setInitial({ flow, run, folder }));
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  });

  replaceEmptyStep = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowsActions.updateAction),
      concatLatestFrom(() =>
        this.store.select(BuilderSelectors.selectCurrentStepName)
      ),
      switchMap(([action, stepName]) => {
        if (action.updatingMissingStep) {
          return of(
            canvasActions.selectStepByName({
              stepName: stepName,
            })
          );
        }
        return EMPTY;
      })
    );
  });
  replaceTrigger = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowsActions.updateTrigger),
      concatLatestFrom(() =>
        this.store.select(BuilderSelectors.selectCurrentFlow)
      ),
      switchMap(([action, flow]) => {
        return of(
          canvasActions.selectStepByName({
            stepName: flow.version.trigger.name,
          })
        );
      })
    );
  });
  selectFirstInvalidStep$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowsActions.selectFirstInvalidStep),
      concatLatestFrom(() =>
        this.store.select(BuilderSelectors.selectCurrentFlow)
      ),
      switchMap(([action, flow]) => {
        const invalidSteps = flowHelper
          .getAllSteps(flow.version.trigger)
          .filter((s) => !s.valid);
        if (invalidSteps.length > 0) {
          return of(
            canvasActions.selectStepByName({
              stepName: invalidSteps[0].name,
            })
          );
        }
        return of(
          canvasActions.selectStepByName({
            stepName: flow.version.trigger.name,
          })
        );
      })
    );
  });

  deleteStep = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowsActions.deleteAction),
      concatLatestFrom(() => [
        this.store.select(BuilderSelectors.selectCurrentRightSideBarType),
      ]),
      switchMap(([{ operation }, rightSidebar]) => {
        if (rightSidebar === RightSideBarType.EDIT_STEP) {
          return of(
            canvasActions.setRightSidebar({
              sidebarType: RightSideBarType.NONE,
              props: NO_PROPS,
              deselectCurrentStep: true,
            })
          );
        }
        return EMPTY;
      })
    );
  });

  addStep = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlowsActions.addAction),
      concatLatestFrom(() =>
        this.store.select(BuilderSelectors.selectCurrentFlow)
      ),
      switchMap(([{ operation }]) => {
        return of(
          canvasActions.selectStepByName({ stepName: operation.action.name })
        );
      })
    );
  });

  stepSelectedEffect = createEffect(() => {
    return this.actions$.pipe(
      ofType(canvasActions.selectStepByName),
      concatLatestFrom(() => [
        this.store.select(BuilderSelectors.selectCurrentStep),
        this.store.select(BuilderSelectors.selectCurrentFlowRun),
      ]),
      tap(() => {
        this.builderAutocompleteService.currentAutocompleteInputId$.next(null);
        this.builderAutocompleteService.currentAutoCompleteInputContainer$.next(
          null
        );
      }),
      switchMap(([{ stepName }, step, run]) => {
        if (step) {
          switch (step.type) {
            case TriggerType.EMPTY:
              return of(
                canvasActions.setRightSidebar({
                  sidebarType: RightSideBarType.TRIGGER_TYPE,
                  props: NO_PROPS,
                  deselectCurrentStep: false,
                })
              );
            case ActionType.MISSING:
              return of(
                canvasActions.setRightSidebar({
                  sidebarType: RightSideBarType.STEP_TYPE,
                  props: NO_PROPS,
                  deselectCurrentStep: false,
                })
              );
            case ActionType.BRANCH:
            case ActionType.CODE:
            case ActionType.LOOP_ON_ITEMS:
            case TriggerType.PIECE:
            case TriggerType.WEBHOOK:
            case ActionType.PIECE: {
              const actionsToDispatch: Array<any> = [
                canvasActions.setRightSidebar({
                  sidebarType: RightSideBarType.EDIT_STEP,
                  props: NO_PROPS,
                  deselectCurrentStep: false,
                }),
              ];
              if (run) {
                actionsToDispatch.push(
                  canvasActions.setLeftSidebar({
                    sidebarType: LeftSideBarType.SHOW_RUN,
                  })
                );
              }
              return of(...actionsToDispatch);
            }
          }
        }
        return EMPTY;
      })
    );
  });

  flowModified$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(...SingleFlowModifyingState),
      concatLatestFrom(() => [
        this.store.select(BuilderSelectors.selectCurrentFlow),
      ]),
      concatMap(([action, flow]) => {
        const genSavedId = UUID.UUID();
        let flowOperation: FlowOperationRequest;
        switch (action.type) {
          case FlowsActionType.UPDATE_TRIGGER: {
            const op = FlowStructureUtil.removeAnySubequentStepsFromTrigger(
              action.operation
            );
            flowOperation = {
              type: FlowOperationType.UPDATE_TRIGGER,
              request: op,
            };
            break;
          }
          case FlowsActionType.ADD_ACTION:
            flowOperation = {
              type: FlowOperationType.ADD_ACTION,
              request: action.operation,
            };
            break;
          case FlowsActionType.UPDATE_ACTION: {
            const op = FlowStructureUtil.removeAnySubequentStepsFromAction(
              action.operation
            );
            flowOperation = {
              type: FlowOperationType.UPDATE_ACTION,
              request: op,
            };
            break;
          }
          case FlowsActionType.DELETE_ACTION:
            flowOperation = {
              type: FlowOperationType.DELETE_ACTION,
              request: action.operation,
            };
            break;
          case FlowsActionType.CHANGE_NAME:
            flowOperation = {
              type: FlowOperationType.CHANGE_NAME,
              request: {
                displayName: action.displayName,
              },
            };
            break;
          case FlowsActionType.MOVE_ACTION:
            flowOperation = {
              type: FlowOperationType.MOVE_ACTION,
              request: action.operation,
            };
        }
        if (flow) {
          return of(
            FlowsActions.applyUpdateOperation({
              flow: flow,
              operation: flowOperation,
              saveRequestId: genSavedId,
            })
          );
        }
        return EMPTY;
      })
    );
  });
  showDraftVersion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ViewModeActions.setViewMode),
      concatLatestFrom(() =>
        this.store.select(BuilderSelectors.selectCurrentFlow)
      ),
      switchMap(([action, flow]) => {
        if (action.viewMode === ViewModeEnum.BUILDING) {
          return of(
            canvasActions.setInitial({ displayedFlowVersion: flow.version })
          );
        }
        return EMPTY;
      })
    );
  });
  applyUpdateOperation$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FlowsActions.applyUpdateOperation),
        concatMap((action) => {
          return this.processFlowUpdate({
            operation: action.operation,
            flow: action.flow,
            saveRequestId: action.saveRequestId,
          });
        }),
        catchError((e) => {
          console.error(e);
          const shownBar = this.snackBar.open(
            'You have unsaved changes on this page due to network disconnection.',
            'Refresh',
            { duration: undefined, panelClass: 'error' }
          );
          shownBar.afterDismissed().subscribe(() => location.reload());
          return of(FlowsActions.savedFailed(e));
        })
      );
    },
    { dispatch: false }
  );

  private processFlowUpdate(request: {
    operation: FlowOperationRequest;
    flow: Flow;
    saveRequestId: UUID;
  }): Observable<Flow> {
    const update$ = this.flowService.update(request.flow.id, request.operation);
    const updateTap = tap((updatedFlow: Flow) => {
      this.store.dispatch(
        FlowsActions.savedSuccess({
          saveRequestId: request.saveRequestId,
          flow: updatedFlow,
        })
      );
      const now = new Date();
      const nowDate = now.toLocaleDateString('en-us', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const nowTime = `${now.getHours().toString().padEnd(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      this.pieceBuilderService.lastSuccessfulSaveDate = `Last saved on ${nowDate} at ${nowTime}.`;
    });
    if (environment.production) {
      return update$.pipe(updateTap);
    }
    //so in development mode the publish button doesn't flicker constantly and cause us to have epilieptic episodes
    return update$.pipe(delay(150), updateTap);
  }

  constructor(
    private pieceBuilderService: CollectionBuilderService,
    private flowService: FlowService,
    private store: Store,
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private builderAutocompleteService: BuilderAutocompleteMentionsDropdownService
  ) {}
}
