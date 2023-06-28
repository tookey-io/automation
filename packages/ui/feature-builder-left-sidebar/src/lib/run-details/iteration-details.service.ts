import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { StepRunResult } from '@activepieces/ui/feature-builder-store';

@Injectable({
  providedIn: 'root',
})
export class RunDetailsService {
  currentStepResult$: BehaviorSubject<
    Pick<StepRunResult, 'displayName' | 'output' | 'stepName'> | undefined
  > = new BehaviorSubject<
    Pick<StepRunResult, 'displayName' | 'output' | 'stepName'> | undefined
  >(undefined);
  iterationStepResultState$: Subject<
    Pick<StepRunResult, 'stepName' | 'output'>
  > = new Subject();
  hideAllIterationsInput$: Subject<boolean> = new Subject();
}
