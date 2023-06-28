import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, of, Subject, tap } from 'rxjs';
import { ActionType, PieceAction, PieceTrigger } from '@activepieces/shared';
import {
  FIRST_LEVEL_PADDING_IN_MENTIONS_LIST,
  MentionListItem,
  MentionTreeNode,
  traverseStepOutputAndReturnMentionTree,
} from '../../utils';
import { MentionsTreeCacheService } from '../mentions-tree-cache.service';
import {
  BuilderSelectors,
  FlowItem,
  canvasActions,
} from '@activepieces/ui/feature-builder-store';
import { FlowItemDetails } from '@activepieces/ui/common';

@Component({
  selector: 'app-piece-step-mention-item',
  templateUrl: './piece-step-mention-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieceStepMentionItemComponent implements OnInit {
  expandSample = false;
  readonly FIRST_LEVEL_PADDING_IN_MENTIONS_LIST =
    FIRST_LEVEL_PADDING_IN_MENTIONS_LIST;
  @Input()
  set stepMention(val: MentionListItem & { step: FlowItem }) {
    if (val.step.type !== ActionType.PIECE) {
      throw new Error('Step is not a piece action');
    }
    this._stepMention = val as MentionListItem & {
      step: PieceTrigger | PieceAction;
    };
  }
  _stepMention: MentionListItem & { step: PieceTrigger | PieceAction };
  @Output() mentionClicked: EventEmitter<MentionListItem> = new EventEmitter();
  @Input() stepIndex: number;
  flowItemDetails$: Observable<FlowItemDetails | undefined>;
  sampleData$: Observable<{
    children: MentionTreeNode[] | undefined;
    error: string;
    markedNodesToShow: Map<string, boolean>;
    value?: unknown;
  }>;
  fetching$: Subject<boolean> = new Subject();
  noSampleDataNote$: Observable<string>;
  search$: Observable<string>;
  constructor(
    private store: Store,
    private mentionsTreeCache: MentionsTreeCacheService
  ) {}
  ngOnInit(): void {
    const cachedResult: undefined | MentionTreeNode = this.getChachedData();
    if (cachedResult) {
      this.mentionsTreeCache.setStepMentionsTree(this._stepMention.step.name, {
        children: cachedResult?.children || [],
        value: cachedResult?.value,
      });
      this.search$ = this.mentionsTreeCache.listSearchBarObs$.pipe(
        tap((res) => {
          this.expandSample = !!res;
        })
      );
      this.sampleData$ = combineLatest({
        stepTree: of({
          children: cachedResult.children,
          error: '',
          value: cachedResult.value,
        }),
        search: this.mentionsTreeCache.listSearchBarObs$,
      }).pipe(
        map((res) => {
          const markedNodesToShow = this.mentionsTreeCache.markNodesToShow(
            this._stepMention.step.name,
            res.search
          );
          return {
            children: res.stepTree.children,
            error: '',
            markedNodesToShow: markedNodesToShow,
            value: res.stepTree.value,
          };
        })
      );
    }
    this.flowItemDetails$ = this.store.select(
      BuilderSelectors.selectFlowItemDetails(this._stepMention.step)
    );
  }
  getChachedData() {
    const step = this._stepMention.step;
    let cachedResult: undefined | MentionTreeNode = undefined;
    if (
      step.type === ActionType.PIECE &&
      step.settings.inputUiInfo.currentSelectedData !== undefined
    ) {
      cachedResult = traverseStepOutputAndReturnMentionTree(
        step.settings.inputUiInfo.currentSelectedData,
        step.name,
        step.displayName
      );
    }
    return cachedResult;
  }

  selectStep() {
    this.store.dispatch(
      canvasActions.selectStepByName({ stepName: this._stepMention.step.name })
    );
  }
}
