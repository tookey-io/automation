import { ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InsertMentionOperation } from '../utils/insert-mention-operation';

@Injectable({
  providedIn: 'root',
})
export class BuilderAutocompleteMentionsDropdownService {
  editStepSection?: ElementRef;
  currentAutoCompleteInputContainer$: BehaviorSubject<HTMLElement | null> =
    new BehaviorSubject<HTMLElement | null>(null);
  currentAutocompleteInputId$: BehaviorSubject<number | null> =
    new BehaviorSubject<number | null>(null);
  mentionEmitted: Subject<{
    id: number;
    insert: InsertMentionOperation;
  }> = new Subject();
  currentInputCanHaveOnlyOneMention = false;
  dataInsertionPopupSize$: BehaviorSubject<
    'fullscreen' | 'docked' | 'collapse'
  > = new BehaviorSubject<'fullscreen' | 'docked' | 'collapse'>('docked');
}
