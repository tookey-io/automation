import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AppConnectionStatus,
  ExecutionOutputStatus,
  StepOutputStatus,
} from '@activepieces/shared';

@Component({
  selector: 'ap-state-icon',
  templateUrl: './state-icon.component.html',
})
export class StateIconComponent implements OnInit, OnChanges {
  @Input() size = 16;
  @Input() showStatusText = true;
  @Input() status:
    | ExecutionOutputStatus
    | StepOutputStatus
    | AppConnectionStatus;
  textAfter = '';
  readonly ExecutionOutputStatus = ExecutionOutputStatus;
  readonly StepOutputStatus = StepOutputStatus;

  iconUrl = '';
  ngOnInit(): void {
    this.textAfter = this.findTextAfter(this.status);
    this.iconUrl = this.findIconUrl(this.status);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.textAfter = this.findTextAfter(this.status);
    this.iconUrl = this.findIconUrl(this.status);
  }
  findIconUrl(
    status: ExecutionOutputStatus | StepOutputStatus | AppConnectionStatus
  ) {
    switch (status) {
      case ExecutionOutputStatus.STOPPED:
      case ExecutionOutputStatus.SUCCEEDED:
      case StepOutputStatus.SUCCEEDED:
      case StepOutputStatus.STOPPED:
      case AppConnectionStatus.EXPIRED:
      case AppConnectionStatus.ACTIVE:
        return 'assets/img/custom/status/success.svg';
      case ExecutionOutputStatus.FAILED:
      case ExecutionOutputStatus.INTERNAL_ERROR:
      case ExecutionOutputStatus.TIMEOUT:
      case StepOutputStatus.FAILED:
      case AppConnectionStatus.ERROR:
        return 'assets/img/custom/status/error.svg';
      case ExecutionOutputStatus.PAUSED:
      case StepOutputStatus.PAUSED:
        return 'assets/img/custom/status/paused.svg';
      case StepOutputStatus.RUNNING:
      case ExecutionOutputStatus.RUNNING:
        return '';
    }
  }
  findTextAfter(
    status: ExecutionOutputStatus | StepOutputStatus | AppConnectionStatus
  ) {
    switch (status) {
      case ExecutionOutputStatus.STOPPED:
      case ExecutionOutputStatus.SUCCEEDED:
      case StepOutputStatus.SUCCEEDED:
      case StepOutputStatus.STOPPED:
        return 'Succeeded';
      case ExecutionOutputStatus.INTERNAL_ERROR:
        return 'Internal Error';
      case ExecutionOutputStatus.TIMEOUT:
        return 'Timed Out';
      case ExecutionOutputStatus.FAILED:
      case StepOutputStatus.FAILED:
        return 'Failed';
      case ExecutionOutputStatus.PAUSED:
      case StepOutputStatus.PAUSED:
        return 'Paused';
      case ExecutionOutputStatus.RUNNING:
      case StepOutputStatus.RUNNING:
        return 'Running';
      case AppConnectionStatus.ACTIVE:
      case AppConnectionStatus.EXPIRED:
        return 'Active';
      case AppConnectionStatus.ERROR:
        return 'Error';
    }
  }
}
