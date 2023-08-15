import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, tap } from 'rxjs';
import { FlowOperationType, FolderDto } from '@activepieces/shared';
import { FoldersSelectors } from '../../../store/folders/folders.selector';
import { FlowService } from '@activepieces/ui/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FolderActions } from '../../../store/folders/folders.actions';

export interface MoveFlowToFolderDialogData {
  flowId: string;
  folderId?: string | null;
}

@Component({
  selector: 'app-move-flow-to-folder-dialog',
  templateUrl: './move-flow-to-folder-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFlowToFolderDialogComponent {
  folders$: Observable<FolderDto[]>;
  foldersForm: FormGroup<{ folder: FormControl<string> }>;
  movingFlow$: Observable<void>;
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private flowService: FlowService,
    @Inject(MAT_DIALOG_DATA)
    public data: MoveFlowToFolderDialogData,
    private dialogRef: MatDialogRef<MoveFlowToFolderDialogComponent>
  ) {
    this.foldersForm = this.fb.group({
      folder: new FormControl('', {
        validators: Validators.required,
        nonNullable: true,
      }),
    });
    this.folders$ = this.store.select(
      FoldersSelectors.selectCurrentFolderExceptCurrent
    );
  }
  moveFlow() {
    if (this.foldersForm.valid) {
      this.movingFlow$ = this.flowService
        .update(this.data.flowId, {
          type: FlowOperationType.CHANGE_FOLDER,
          request: {
            folderId:
              this.foldersForm.controls.folder.value === 'NULL'
                ? null
                : this.foldersForm.controls.folder.value,
          },
        })
        .pipe(
          tap(() => {
            this.store.dispatch(
              FolderActions.moveFlow({
                targetFolderId: this.foldersForm.controls.folder.value,
                flowFolderId: this.data.folderId,
              })
            );
            this.dialogRef.close(true);
          }),
          map(() => void 0)
        );
    }
  }
}
