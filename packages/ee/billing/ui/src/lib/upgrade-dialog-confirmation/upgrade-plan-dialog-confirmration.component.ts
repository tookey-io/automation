import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { isNil } from '@activepieces/shared';
import { BillingService } from '../billing.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './upgrade-plan-dialog-confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradePlanConfirmationDialogComponent {
  options = {
    path: '/assets/lottie/rocket.json',
  };
  upgrade$: Observable<void> | undefined;
  constructor(
    private billingService: BillingService,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      planId: string;
    },
    private dialogRef: MatDialogRef<UpgradePlanConfirmationDialogComponent>
  ) {}
  upgrade() {
    this.upgrade$ = this.billingService.upgrade(this.data.planId).pipe(
      tap((response: { paymentLink: string | null }) => {
        const paymentLink = response.paymentLink;
        if (!isNil(paymentLink)) {
          window.open(paymentLink, '_blank', 'noopener noreferer');
        }
        this.dialogRef.close(true);
      }),
      map(() => void 0)
    );
  }
}
