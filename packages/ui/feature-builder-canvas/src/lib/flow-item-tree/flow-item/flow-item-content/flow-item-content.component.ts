import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { RunDetailsService } from '@activepieces/ui/feature-builder-left-sidebar';
import {
  ActionType,
  ExecutionOutputStatus,
  FlowRun,
  StepOutput,
  StepOutputStatus,
  TriggerType,
  flowHelper,
} from '@activepieces/shared';
import {
  PieceMetadataService,
  CORE_PIECES_ACTIONS_NAMES,
  CORE_PIECES_TRIGGERS,
  FlowItemDetails,
  corePieceIconUrl,
  fadeIn400ms,
  isOverflown,
} from '@activepieces/ui/common';
import {
  BuilderSelectors,
  FlowItem,
  FlowRendererService,
  canvasActions,
} from '@activepieces/ui/feature-builder-store';

@Component({
  selector: 'app-flow-item-content',
  templateUrl: './flow-item-content.component.html',
  styleUrls: ['./flow-item-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn400ms],
})
export class FlowItemContentComponent implements OnInit {
  //in case it is not reached, we return undefined
  @ViewChild('stepDragTemplate') stepDragTemplate: TemplateRef<any>;
  stepStatus$: Observable<StepOutputStatus | undefined>;
  stepInsideLoopStatus$: Observable<StepOutputStatus | undefined>;
  hover = false;
  flowItemChanged$: Subject<boolean> = new Subject();
  stepIconUrl: string;
  _flowItem: FlowItem;
  selectedRun$: Observable<FlowRun | undefined>;

  stepAppName$: Observable<string>;
  isOverflown = isOverflown;
  childStepsIconsUrls: Record<string, Observable<string>> = {};
  StepOutputStatus = StepOutputStatus;
  ExecutionOutputStatus = ExecutionOutputStatus;
  TriggerType = TriggerType;
  ActionType = ActionType;
  @Input() selected: boolean;
  @Input() trigger = false;
  @Input() readOnly: boolean;
  @Input() set flowItem(newFlowItem: FlowItem) {
    this._flowItem = newFlowItem;
    this.stepAppName$ = this.getStepAppName();
    this.childStepsIconsUrls = this.extractChildStepsIconsUrls();
    this.flowItemChanged$.next(true);
    this.fetchFlowItemDetailsAndLoadLogo();
  }
  isDragging$: Observable<boolean>;
  stepOutput: StepOutput | undefined;
  flowItemDetails$: Observable<FlowItemDetails | null | undefined>;
  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    private runDetailsService: RunDetailsService,
    private flowRendererService: FlowRendererService,
    private actionMetaDataService: PieceMetadataService
  ) {}

  ngOnInit(): void {
    this.isDragging$ = this.flowRendererService.draggingSubject.asObservable();
    this.selectedRun$ = this.store.select(
      BuilderSelectors.selectCurrentFlowRun
    );
    this.childStepsIconsUrls = this.extractChildStepsIconsUrls();
    this.stepStatus$ = this.getStepStatusIfItsNotInsideLoop();
    this.stepInsideLoopStatus$ =
      this.runDetailsService.iterationStepResultState$.pipe(
        filter((stepNameAndStatus) => {
          return stepNameAndStatus.stepName === this._flowItem.name;
        }),
        map((stepNameAndStatus) => {
          this.stepOutput = stepNameAndStatus.output;
          return stepNameAndStatus.output?.status;
        })
      );
    this.fetchFlowItemDetailsAndLoadLogo();
  }

  private fetchFlowItemDetailsAndLoadLogo() {
    this.flowItemDetails$ = this.store
      .select(BuilderSelectors.selectAllFlowItemsDetailsLoadedState)
      .pipe(
        takeUntil(this.flowItemChanged$),
        switchMap((loaded) => {
          if (loaded) {
            return this.store
              .select(BuilderSelectors.selectFlowItemDetails(this._flowItem))
              .pipe(
                tap((flowItemDetails) => {
                  if (flowItemDetails) {
                    const itemIcon = new Image();
                    itemIcon.src = flowItemDetails.logoUrl!;
                    itemIcon.onload = () => {
                      this.stepIconUrl = flowItemDetails.logoUrl!;
                      this.cd.markForCheck();
                    };
                  } else {
                    console.error(
                      `Flow item has no details:${this._flowItem.name}`
                    );
                  }
                })
              );
          }
          return of(null);
        })
      );
  }

  getStepStatusIfItsNotInsideLoop(): Observable<StepOutputStatus | undefined> {
    return this.selectedRun$.pipe(
      distinctUntilChanged(),
      map((selectedRun) => {
        if (selectedRun) {
          if (selectedRun.status !== ExecutionOutputStatus.RUNNING) {
            const stepName = this._flowItem.name;
            const executionState = selectedRun.executionOutput?.executionState;
            if (!executionState) {
              throw new Error('Flow is done but there is no executionState');
            }
            const result = executionState.steps[stepName.toString()];
            if (result) {
              this.stepOutput = result;
            }
            return result === undefined ? undefined : result.status;
          } else {
            return StepOutputStatus.RUNNING;
          }
        }
        return undefined;
      }),
      shareReplay(1)
    );
  }

  selectStep() {
    this.store.dispatch(
      canvasActions.selectStepByName({
        stepName: this._flowItem.name,
      })
    );
    this.runDetailsService.currentStepResult$.next({
      stepName: this._flowItem.name,
      output: this.stepOutput,
    });
  }

  getStepAppName() {
    switch (this._flowItem.type) {
      case ActionType.BRANCH:
        return of('Branch');
      case ActionType.MISSING:
        return of('Missing');
      case ActionType.CODE:
        return of('Code');
      case ActionType.LOOP_ON_ITEMS:
        return of('Loop');
      case ActionType.PIECE:
      case TriggerType.PIECE:
        return this.actionMetaDataService
          .getPieceMetadata(
            this._flowItem.settings.pieceName,
            this._flowItem.settings.pieceVersion
          )
          .pipe(map((p) => p.displayName));
      case TriggerType.EMPTY:
        return of('Choose a trigger');
      case TriggerType.WEBHOOK:
        return of('Webhook trigger');
    }
  }
  extractChildStepsIconsUrls() {
    const stepsIconsUrls: Record<string, Observable<string>> = {};
    if (
      this._flowItem.type === ActionType.BRANCH ||
      this._flowItem.type === ActionType.LOOP_ON_ITEMS
    ) {
      const steps = flowHelper.getAllChildSteps(this._flowItem);
      steps.forEach((s) => {
        if (s.type === ActionType.PIECE) {
          const pieceMetaData$ = this.actionMetaDataService
            .getPieceMetadata(s.settings.pieceName, s.settings.pieceVersion)
            .pipe(
              map((md) => {
                if (
                  CORE_PIECES_ACTIONS_NAMES.find(
                    (n) => s.settings.pieceName === n
                  ) ||
                  CORE_PIECES_TRIGGERS.find((n) => s.settings.pieceName === n)
                ) {
                  return corePieceIconUrl(s.settings.pieceName);
                }
                return md.logoUrl;
              })
            );
          stepsIconsUrls[s.settings.pieceName] = pieceMetaData$;
        } else if (s.type !== ActionType.MISSING) {
          const icon = this.actionMetaDataService.findNonPieceStepIcon(s.type);
          stepsIconsUrls[icon.key] = of(icon.url);
        }
      });
    }

    return stepsIconsUrls;
  }
}
