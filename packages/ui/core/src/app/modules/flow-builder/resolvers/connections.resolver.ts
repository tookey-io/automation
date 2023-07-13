import { Injectable } from '@angular/core';

import { map, Observable, switchMap, take } from 'rxjs';
import { AppConnection } from '@activepieces/shared';

import {
  AppConnectionsService,
  ProjectSelectors,
} from '@activepieces/ui/common';
import { Store } from '@ngrx/store';

export type ConnectionsResolverData = AppConnection[];

@Injectable({
  providedIn: 'root',
})
export class ConnectionsResolver {
  constructor(
    private appConnectionsService: AppConnectionsService,
    private store: Store
  ) {}
  resolve(): Observable<AppConnection[]> {
    return this.store.select(ProjectSelectors.selectProject).pipe(
      take(1),
      switchMap(() => {
        return this.appConnectionsService.list({ limit: 999999 });
      }),
      map((res) => {
        return res.data;
      })
    );
  }
}
