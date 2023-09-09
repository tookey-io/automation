import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { Observable, tap, map, switchMap, take, BehaviorSubject } from 'rxjs';
import { FolderDto } from '@activepieces/shared';
import { Store } from '@ngrx/store';
import { FoldersSelectors } from '../../../store/folders/folders.selector';
import { FolderActions } from '../../../store/folders/folders.actions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DeleteEntityDialogComponent,
  DeleteEntityDialogData,
  FoldersService,
} from '@activepieces/ui/common';
import {
  RenameFolderDialogComponent,
  RenameFolderDialogData,
} from '../rename-folder-dialog/rename-folder-dialog.component';

@Component({
  selector: 'app-folders-list',
  templateUrl: './folders-list.component.html',
  styleUrls: ['./folders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoldersListComponent {
  sortFolders$: BehaviorSubject<'asc' | 'desc'> = new BehaviorSubject<
    'asc' | 'desc'
  >('asc');
  allFlowsNumber$: Observable<number>;
  uncategorizedFlowsNumber$: Observable<number>;
  folders$: Observable<FolderDto[]>;
  selectedFolder$: Observable<FolderDto | undefined>;
  showAllFlows$: Observable<boolean>;
  createFolderDialogClosed$: Observable<void>;
  folderIdOfMenuOpened: string | undefined = undefined;
  constructor(
    private dialogService: MatDialog,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private folderService: FoldersService
  ) {
    this.folders$ = this.sortFolders$.pipe(
      switchMap((res) => {
        if (res === 'asc') {
          return this.store.select(FoldersSelectors.selectFoldersAsc);
        } else {
          return this.store.select(FoldersSelectors.selectFoldersDesc);
        }
      })
    );
    this.allFlowsNumber$ = this.store.select(
      FoldersSelectors.selectAllFlowsNumber
    );
    this.uncategorizedFlowsNumber$ = this.store.select(
      FoldersSelectors.selectUncategorizedFlowsNumber
    );
    this.selectedFolder$ = this.store.select(
      FoldersSelectors.selectCurrentFolder
    );
    this.showAllFlows$ = this.store.select(
      FoldersSelectors.selectDisplayAllFlows
    );
  }
  createFolder() {
    const dialogRef = this.dialogService.open(NewFolderDialogComponent, {
      restoreFocus: false,
    });
    this.createFolderDialogClosed$ = dialogRef.afterClosed().pipe(
      tap((folderId: string) => {
        if (folderId) {
          this.clearCursorParam(folderId);
          this.scrollToFolder(folderId);
        }
      }),
      map(() => void 0)
    );
  }
  setSelectedFolder(folderId: string) {
    this.clearCursorParam(folderId);
  }
  showAllFlows() {
    this.store.dispatch(FolderActions.showAllFlows());
    this.clearCursorParam();
  }

  clearCursorParam(folderId?: string) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { cursor: undefined, folderId: folderId },
      queryParamsHandling: 'merge',
    });
  }
  deleteFolder(folder: FolderDto) {
    const dialogData: DeleteEntityDialogData = {
      deleteEntity$: this.store
        .select(FoldersSelectors.selectCurrentFolder)
        .pipe(
          take(1),
          switchMap((res) => {
            return this.folderService.delete(folder.id).pipe(
              tap(() => {
                this.store.dispatch(
                  FolderActions.deleteFolder({ folderId: folder.id })
                );
                if (res?.id === folder.id) {
                  this.clearCursorParam();
                }
              })
            );
          })
        ),
      entityName: folder.displayName,
      note: 'If you delete this folder, we will keep its flows and move them to Uncategorized.',
    };
    this.dialogService.open(DeleteEntityDialogComponent, { data: dialogData });
  }
  renameFolder(folder: FolderDto) {
    const dialogData: RenameFolderDialogData = {
      folderId: folder.id,
      folderDisplayName: folder.displayName,
    };
    this.dialogService.open(RenameFolderDialogComponent, { data: dialogData });
  }
  scrollToFolder(folderId: string) {
    const folderDiv = document.getElementById(folderId);
    folderDiv?.scrollIntoView({ behavior: 'smooth' });
  }
  toggleFolderSorting() {
    if (this.sortFolders$.value === 'desc') {
      this.sortFolders$.next('asc');
    } else {
      this.sortFolders$.next('desc');
    }
  }
}
