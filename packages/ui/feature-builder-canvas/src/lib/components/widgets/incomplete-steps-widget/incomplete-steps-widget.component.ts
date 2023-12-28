import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fadeIn400msWithoutOut } from '@activepieces/ui/common';
import { Store } from '@ngrx/store';
import {
  BuilderSelectors,
  FlowsActions,
} from '@activepieces/ui/feature-builder-store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-incomplete-steps-widget',
  templateUrl: './incomplete-steps-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn400msWithoutOut],
})
export class IncompleteStepsWidgetComponent {
  numberOfInvalidSteps$: Observable<number>;
  isShowingPublishedVersion$: Observable<boolean>;
  constructor(private store: Store) {
    this.numberOfInvalidSteps$ = this.store.select(
      BuilderSelectors.selectNumberOfInvalidSteps
    );
    this.isShowingPublishedVersion$ = this.store.select(
      BuilderSelectors.selectIsInPublishedVersionViewMode
    );
  }
  selectFirstInvalidStep() {
    this.store.dispatch(FlowsActions.selectFirstInvalidStep());
  }
}
