import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, startWith, Subject, tap } from 'rxjs';
import {
  AppConnection,
  AppConnectionStatus,
  SeekPage,
} from '@activepieces/shared';
import {
  PieceMetadataService,
  DeleteEntityDialogComponent,
  DeleteEntityDialogData,
} from '@activepieces/ui/common';
import { ConnectionsTableDataSource } from './connections-table.datasource';
import { ApPaginatorComponent } from '@activepieces/ui/common';
import { AppConnectionsService } from '@activepieces/ui/common';
import { Store } from '@ngrx/store';

@Component({
  templateUrl: './connections-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsTableComponent implements OnInit {
  @ViewChild(ApPaginatorComponent, { static: true })
  paginator!: ApPaginatorComponent;
  connectionPage$: Observable<SeekPage<AppConnection>>;
  dataSource!: ConnectionsTableDataSource;
  displayedColumns = ['app', 'name', 'status', 'created', 'updated', 'action'];
  connectionDeleted$: Subject<boolean> = new Subject();
  deleteConnectionDialogClosed$: Observable<void>;
  readonly AppConnectionStatus = AppConnectionStatus;
  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private pieceMetadataService: PieceMetadataService,
    private connectionService: AppConnectionsService,
    private dialogService: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource = new ConnectionsTableDataSource(
      this.activatedRoute.queryParams,
      this.paginator,
      this.store,
      this.pieceMetadataService,
      this.connectionService,
      this.connectionDeleted$.asObservable().pipe(startWith(true))
    );
  }

  deleteConnection(connection: AppConnection) {
    const dialogRef = this.dialogService.open(DeleteEntityDialogComponent, {
      data: {
        deleteEntity$: this.connectionService.delete(connection.id),
        entityName: connection.name,
        note: `This will permanently delete the connection, all steps using it will fail.
         You can't undo this action.`,
      } as DeleteEntityDialogData,
    });
    this.deleteConnectionDialogClosed$ = dialogRef.beforeClosed().pipe(
      tap((res) => {
        if (res) {
          this.connectionDeleted$.next(true);
        }
      }),
      map(() => {
        return void 0;
      })
    );
  }
}
