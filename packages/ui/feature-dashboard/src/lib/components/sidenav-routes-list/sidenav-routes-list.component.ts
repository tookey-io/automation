import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FolderActions } from '../../store/folders/folders.actions';
import { EmbeddingService, NavigationService } from '@activepieces/ui/common';
import { Observable, map, of, switchMap } from 'rxjs';
import { ApEdition, ApFlagId, supportUrl } from '@activepieces/shared';
import { DashboardService, FlagService } from '@activepieces/ui/common';

type SideNavRoute = {
  icon: string;
  caption: string;
  route: string;
  effect?: () => void;
  showInSideNav$: Observable<boolean>;
};

@Component({
  selector: 'app-sidenav-routes-list',
  templateUrl: './sidenav-routes-list.component.html',
  styleUrls: ['./sidenav-routes-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavRoutesListComponent implements OnInit {
  logoUrl$: Observable<string>;
  showSupport$: Observable<boolean>;
  showDocs$: Observable<boolean>;
  showBilling$: Observable<boolean>;
  isInEmbedding$: Observable<boolean>;
  sideNavRoutes$: Observable<SideNavRoute[]>;

  mainDashboardRoutes: SideNavRoute[] = [];
  platformDashboardRoutes: SideNavRoute[] = [
    {
      icon: 'assets/img/custom/dashboard/projects.svg',
      caption: $localize`Projects`,
      route: 'platform/projects',
      showInSideNav$: of(true),
    },
    {
      icon: 'assets/img/custom/dashboard/appearance.svg',
      caption: $localize`Appearance`,
      route: 'platform/appearance',
      showInSideNav$: of(true),
    },
    {
      icon: 'assets/img/custom/dashboard/pieces.svg',
      caption: $localize`Pieces`,
      route: 'platform/pieces',
      showInSideNav$: of(true),
    },
    {
      icon: 'assets/img/custom/dashboard/templates.svg',
      caption: $localize`Templates`,
      route: 'platform/templates',
      showInSideNav$: of(true),
    },
    {
      icon: 'assets/img/custom/dashboard/settings.svg',
      caption: $localize`Settings`,
      route: 'platform/settings',
      showInSideNav$: of(true),
    },
  ];
  constructor(
    public router: Router,
    private store: Store,
    private flagServices: FlagService,
    private cd: ChangeDetectorRef,
    private embeddingService: EmbeddingService,
    private dashboardService: DashboardService,
    private navigationService: NavigationService
  ) {
    this.isInEmbedding$ = this.embeddingService.getIsInEmbedding$();
    this.logoUrl$ = this.flagServices
      .getLogos()
      .pipe(map((logos) => logos.logoIconUrl));
    this.mainDashboardRoutes = [
      {
        icon: 'assets/img/custom/dashboard/flows.svg',
        caption: $localize`Flows`,
        route: 'flows',
        effect: () => {
          this.store.dispatch(FolderActions.showAllFlows());
        },
        showInSideNav$: of(true),
      },
      {
        icon: 'assets/img/custom/dashboard/runs.svg',
        caption: $localize`Runs`,
        route: 'runs',
        showInSideNav$: of(true),
      },
      {
        icon: 'assets/img/custom/dashboard/connections.svg',
        caption: $localize`Connections`,
        route: 'connections',
        showInSideNav$: of(true),
      },
      {
        icon: 'assets/img/custom/dashboard/members.svg',
        caption: $localize`Team`,
        route: 'team',
        showInSideNav$: this.isInEmbedding$.pipe(
          switchMap((embedded) => {
            return this.flagServices.getEdition().pipe(
              map((ed) => {
                return ed !== ApEdition.COMMUNITY && !embedded;
              })
            );
          })
        ),
      },
    ];
  }
  ngOnInit(): void {
    this.showDocs$ = this.flagServices.isFlagEnabled(ApFlagId.SHOW_DOCS);
    this.showSupport$ = this.flagServices.isFlagEnabled(
      ApFlagId.SHOW_COMMUNITY
    );
    this.showBilling$ = this.flagServices.isFlagEnabled(ApFlagId.SHOW_BILLING);
    this.sideNavRoutes$ = this.dashboardService.getIsInPlatformRoute().pipe(
      map((isInPlatformDashboard) => {
        if (!isInPlatformDashboard) {
          return this.mainDashboardRoutes;
        }
        return this.platformDashboardRoutes;
      })
    );
  }

  openDocs() {
    window.open('https://tookey.gitbook.io/docs', '_blank', 'noopener');
  }
  redirectHome(newWindow: boolean) {
    this.navigationService.navigate('/flows', newWindow);
  }

  markChange() {
    this.cd.detectChanges();
  }

  public isActive(route: string) {
    return this.router.url.includes(route);
  }

  openSupport() {
    window.open(supportUrl, '_blank', 'noopener');
  }
}
