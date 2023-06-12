import { AppConnection, AppConnectionType } from '@activepieces/shared';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { AppConnectionsService } from '../../services/app-connections.service';
import { ConnectionValidator } from '../../validators/connectionNameValidator';
import {
  BuilderSelectors,
  appConnectionsActions,
} from '@activepieces/ui/feature-builder-store';

interface SecretTextForm {
  secretText: FormControl<string>;
  name: FormControl<string>;
}
export interface SecretTextConnectionDialogData {
  pieceName: string;
  connectionName?: string;
  displayName: string;
  description: string;
  secretText?: string;
}

@Component({
  selector: 'app-secret-text-connection-dialog',
  templateUrl: './secret-text-connection-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretTextConnectionDialogComponent {
  settingsForm: FormGroup<SecretTextForm>;
  keyTooltip =
    'The ID of this connection definition. You will need to select this key whenever you want to reuse this connection.';
  loading = false;
  upsert$: Observable<AppConnection | null>;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogData: SecretTextConnectionDialogData,
    private fb: FormBuilder,
    private store: Store,
    private appConnectionsService: AppConnectionsService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<SecretTextConnectionDialogComponent>
  ) {
    this.settingsForm = this.fb.group({
      secretText: new FormControl(this.dialogData.secretText || '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      name: new FormControl(
        appConnectionsService.getConnectionNameSuggest(
          this.dialogData.pieceName
        ),
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern('[A-Za-z0-9_\\-]*'),
          ],
          asyncValidators: [
            ConnectionValidator.createValidator(
              this.store
                .select(BuilderSelectors.selectAllAppConnections)
                .pipe(take(1)),
              undefined
            ),
          ],
        }
      ),
    });
    if (this.dialogData.connectionName) {
      this.settingsForm.controls.name.disable();
    }
  }
  submit() {
    this.settingsForm.markAllAsTouched();
    if (!this.loading && this.settingsForm.valid) {
      this.loading = true;
      this.upsert$ = this.appConnectionsService
        .upsert({
          appName: this.dialogData.pieceName,
          name: this.settingsForm.controls.name.value,
          value: {
            secret_text: this.settingsForm.controls.secretText.value,
            type: AppConnectionType.SECRET_TEXT,
          },
        })
        .pipe(
          catchError((err) => {
            console.error(err);
            this.snackbar.open(
              'Connection operation failed please check your console.',
              'Close',
              { panelClass: 'error', duration: 5000 }
            );
            return of(null);
          }),
          tap((connection) => {
            if (connection) {
              this.store.dispatch(
                appConnectionsActions.upsert({ connection: connection })
              );
              this.dialogRef.close(connection);
            }
            this.loading = false;
          })
        );
    }
  }
}
