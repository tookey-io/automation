import { Injectable } from '@angular/core';
import {
  ActionType,
  ApEdition,
  InstallPieceRequest,
  PieceOptionRequest,
  TriggerType,
} from '@activepieces/shared';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  shareReplay,
  map,
  forkJoin,
  switchMap,
  Subject,
  combineLatest,
  startWith,
  take,
} from 'rxjs';
import semver from 'semver';
import { environment } from '../environments/environment';
import { FlowItemDetails } from '../models/flow-item-details';
import { FlagService } from './flag.service';
import {
  DropdownState,
  PiecePropertyMap,
  TriggerBase,
  PieceMetadata,
  PieceMetadataSummary,
  TriggerStrategy,
} from '@activepieces/pieces-framework';
import { isNil } from '@activepieces/shared';

type TriggersMetadata = Record<string, TriggerBase>;

export const CORE_PIECES_ACTIONS_NAMES = [
  '@activepieces/piece-tookey-wallet',
  '@activepieces/piece-store',
  '@activepieces/piece-data-mapper',
  '@activepieces/piece-connections',
  '@activepieces/piece-delay',
  '@activepieces/piece-http',
  '@activepieces/piece-smtp',
  '@activepieces/piece-sftp',
  '@activepieces/piece-approval',
];
export const corePieceIconUrl = (pieceName: string) =>
  `assets/img/custom/piece/${pieceName.replace(
    '@activepieces/piece-',
    ''
  )}_mention.png`;
export const CORE_SCHEDULE = '@activepieces/piece-schedule';
export const CORE_PIECES_TRIGGERS = [CORE_SCHEDULE];
@Injectable({
  providedIn: 'root',
})
export class PieceMetadataService {
  private release$ = this.flagsService.getRelease().pipe(shareReplay(1));
  private clearCache$ = new Subject<void>();
  private piecesManifest$ = combineLatest([
    this.release$,
    this.clearCache$.asObservable().pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([release]) => {
      return this.http.get<PieceMetadataSummary[]>(
        `${environment.apiUrl}/pieces?release=${release}`
      );
    }),
    shareReplay(1)
  );

  private piecesCache = new Map<string, Observable<PieceMetadata>>();

  private edition$ = this.flagsService.getEdition();

  public coreFlowItemsDetails: FlowItemDetails[] = [
    {
      type: ActionType.CODE,
      name: 'Code',
      description: 'Powerful nodejs & typescript code with npm',
      logoUrl: '/assets/img/custom/piece/code.svg',
      tags: ['core', 'low-level'],
    },
    {
      type: ActionType.BRANCH,
      name: 'Branch',
      description: 'Decide what happens based on an if condition result',
      logoUrl: '/assets/img/custom/piece/branch.svg',
      tags: ['core', 'low-level'],
    },
    {
      type: ActionType.LOOP_ON_ITEMS,
      name: 'Loop',
      description: 'Loop on a list of items',
      logoUrl: '/assets/img/custom/piece/loop.svg',
      tags: ['core', 'low-level'],
    },
  ];

  public triggerItemsDetails: FlowItemDetails[] = [
    {
      type: TriggerType.WEBHOOK,
      name: 'Webhook',
      description: 'Trigger flow by calling a unique web url',
      logoUrl: '/assets/img/custom/piece/webhook.svg',
      tags: ['core', 'low-level'],
    },
    {
      type: TriggerType.EMPTY,
      name: 'Trigger',
      description: 'Choose a trigger',
      logoUrl: '/assets/img/custom/piece/empty-trigger.svg',
      tags: ['core', 'low-level'],
    },
  ];

  constructor(private http: HttpClient, private flagsService: FlagService) {}

  private getCacheKey(pieceName: string, pieceVersion: string): string {
    return `${pieceName}-${pieceVersion}`;
  }
  private filterAppWebhooks(
    triggersMap: TriggersMetadata,
    edition: ApEdition
  ): TriggersMetadata {
    if (edition !== ApEdition.COMMUNITY) {
      return triggersMap;
    }

    const triggersList = Object.entries(triggersMap);

    const filteredTriggersList = triggersList.filter(
      ([, trigger]) => trigger.type !== TriggerStrategy.APP_WEBHOOK
    );

    return Object.fromEntries(filteredTriggersList);
  }

  private fetchPieceMetadata(
    pieceName: string,
    pieceVersion: string
  ): Observable<PieceMetadata> {
    return this.http.get<PieceMetadata>(
      `${environment.apiUrl}/pieces/${encodeURIComponent(
        pieceName
      )}?version=${pieceVersion}`
    );
  }

  installCommunityPiece(req: InstallPieceRequest) {
    return this.http.post<PieceMetadataSummary>(
      `${environment.apiUrl}/pieces`,
      req
    );
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/pieces/${id}`);
  }

  clearCache() {
    this.clearCache$.next();
  }

  getCommunityPieces(): Observable<PieceMetadataSummary[]> {
    return this.piecesManifest$.pipe(
      map((pieces) => pieces.filter((p) => !isNil(p.projectId)))
    );
  }

  getPiecesManifest(): Observable<PieceMetadataSummary[]> {
    return this.piecesManifest$.pipe(take(1));
  }

  getLatestVersion(pieceName: string): Observable<string | undefined> {
    return this.getPiecesManifest().pipe(
      map((pieces) => {
        const filteredPieces = pieces.filter(
          (piece) => piece.name === pieceName
        );
        if (filteredPieces.length === 0) {
          return undefined;
        }
        return filteredPieces
          .sort((a, b) => semver.compare(b.version, a.version))
          .map((piece) => piece.version)[0];
      }),
      take(1)
    );
  }

  getPieceNameLogo(pieceName: string): Observable<string | undefined> {
    return this.piecesManifest$.pipe(
      map((pieces) => pieces.find((piece) => piece.name === pieceName)?.logoUrl)
    );
  }

  getPieceMetadata(
    pieceName: string,
    pieceVersion: string
  ): Observable<PieceMetadata> {
    const cacheKey = this.getCacheKey(pieceName, pieceVersion);

    if (this.piecesCache.has(cacheKey)) {
      return this.piecesCache.get(cacheKey)!;
    }
    const pieceMetadata$ = forkJoin({
      pieceMetadata: this.fetchPieceMetadata(pieceName, pieceVersion),
      edition: this.edition$,
    }).pipe(
      map(({ pieceMetadata, edition }) => {
        pieceMetadata.triggers = this.filterAppWebhooks(
          pieceMetadata.triggers,
          edition
        );
        return pieceMetadata;
      }),
      shareReplay(1)
    );

    this.piecesCache.set(cacheKey, pieceMetadata$);
    return this.piecesCache.get(cacheKey)!;
  }

  getPieceActionConfigOptions<
    T extends DropdownState<unknown> | PiecePropertyMap
  >(req: PieceOptionRequest) {
    return this.http.post<T>(environment.apiUrl + `/pieces/options`, req);
  }
  findNonPieceStepIcon(type: ActionType | TriggerType) {
    switch (type) {
      case ActionType.CODE:
        return { url: 'assets/img/custom/piece/code_mention.png', key: 'code' };
      case ActionType.BRANCH:
        return {
          url: 'assets/img/custom/piece/branch_mention.png',
          key: 'branch',
        };
      case ActionType.LOOP_ON_ITEMS:
        return {
          url: 'assets/img/custom/piece/loop_mention.png',
          key: 'loop',
        };
      case TriggerType.WEBHOOK:
        return {
          url: 'assets/img/custom/piece/webhook_mention.png',
          key: 'webhook',
        };
    }

    throw new Error("Step type isn't accounted for");
  }
}
