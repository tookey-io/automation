import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  startWith,
  take,
  tap,
} from 'rxjs';
import { ActionType, TriggerType } from '@activepieces/shared';
import { MentionListItem } from '../utils';
import { MentionsTreeCacheService } from './mentions-tree-cache.service';
import {
  BuilderSelectors,
  FlowItem,
} from '@activepieces/ui/feature-builder-store';
import {
  BuilderAutocompleteMentionsDropdownService,
  InsertMentionOperation,
} from '@activepieces/ui/common';

@Component({
  selector: 'app-mentions-list',
  templateUrl: './mentions-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentionsListComponent implements OnInit, AfterViewInit {
  searchFormControl: FormControl<string> = new FormControl('', {
    nonNullable: true,
  });
  stepsMentions$: Observable<(MentionListItem & { step: FlowItem })[]>;
  expandConfigs = false;
  expandConnections = false;
  readonly ActionType = ActionType;
  readonly TriggerType = TriggerType;
  @ViewChild('searchInput', { read: ElementRef })
  searchInput: ElementRef;
  @Output()
  addMention: EventEmitter<InsertMentionOperation> = new EventEmitter();
  @Output()
  closeMenu: EventEmitter<void> = new EventEmitter();
  @Input()
  focusSearchInput$?: Observable<boolean>;
  constructor(
    private store: Store,
    private mentionsTreeCache: MentionsTreeCacheService,
    public builderAutocompleteService: BuilderAutocompleteMentionsDropdownService
  ) {
    this.mentionsTreeCache.listSearchBarObs$ =
      this.searchFormControl.valueChanges.pipe(
        startWith(''),
        distinctUntilChanged(),
        shareReplay(1)
      );
    this.stepsMentions$ = combineLatest({
      steps: this.store
        .select(BuilderSelectors.selectAllStepsForMentionsDropdown)
        .pipe(take(1)),
      search: this.mentionsTreeCache.listSearchBarObs$,
    }).pipe(
      map((res) => {
        return res.steps.filter(
          (item) =>
            item.label.toLowerCase().includes(res.search.toLowerCase()) ||
            this.mentionsTreeCache.searchForSubstringInKeyOrValue(
              item.step.name,
              res.search
            )
        );
      })
    );
  }
  ngAfterViewInit(): void {
    if (this.focusSearchInput$) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 1);
    }
  }
  ngOnInit(): void {
    if (this.focusSearchInput$) {
      this.focusSearchInput$ = this.focusSearchInput$.pipe(
        tap((val) => {
          if (val && this.searchInput) {
            this.searchInput.nativeElement.focus();
          }
        })
      );
    }
  }
  mentionClicked(mention: MentionListItem) {
    this.addMention.emit({
      insert: {
        mention: {
          serverValue: mention.value,
          value: mention.label,
          denotationChar: '',
        },
      },
    });
  }
}
