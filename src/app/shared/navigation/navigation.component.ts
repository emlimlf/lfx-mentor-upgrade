// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, HostBinding, OnInit, Input } from '@angular/core';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

import {
  GoAction,
  ACCOUNT_ROUTE,
  LANDING_ROUTE,
  PROJECT_ROUTE,
  APPLY_ROUTE,
  DONATE_ROUTE,
  getCurrentAlertSelector,
  readParameterFromRouterState,
} from '@app/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '@app/services/project.service';
import { DownloadService } from '@app/services/download.service';

export enum NavPage {
  HOME,
  APPLY,
  DISCOVER,
  DONATE,
  NONE,
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  @HostBinding('class') classes = 'navbar navbar-default navbar-light py-0';

  readonly navPage = NavPage;

  currentPage$: Observable<NavPage>;
  isLoggedIn: Observable<boolean>;
  isCollapsed = true;
  isScrolled = false;
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;
  alertVisible$: Observable<boolean>;
  profile: any;

  @Input() userName!: string;
  @Input() userAvatar: any = '';

  @Input() userEmail!: string;

  showNav = false;

  constructor(
    private store: Store<any>,
    private router: Router,
    private authService: AuthService,
    private state: ActivatedRoute,
    private downloadService: DownloadService,
    private projectService: ProjectService
  ) {
    const currentAlert$ = store.select(getCurrentAlertSelector);
    this.alertVisible$ = currentAlert$.pipe(map(alert => alert !== undefined));

    this.currentPage$ = this.router.events.pipe(
      map(event => {
        return this.selectPageFromUrl((event as RouterEvent).url);
      })
    );
    this.isLoggedIn = authService.isAuthenticated$;
  }

  private selectPageFromUrl(url: String) {
    switch (url) {
      case '/' + LANDING_ROUTE:
        return NavPage.HOME;
      case '/' + PROJECT_ROUTE:
        return NavPage.DISCOVER;
      case '/' + APPLY_ROUTE:
        return NavPage.APPLY;
      case '/' + DONATE_ROUTE:
        return NavPage.DONATE;
      default:
        return NavPage.NONE;
    }
  }

  ngOnInit() {
    if (window.scrollY === 0) {
      this.isScrolled = false;
    } else {
      this.isScrolled = true;
    }
    window.onscroll = () => {
      if (window.scrollY === 0) {
        this.isScrolled = false;
      } else {
        this.isScrolled = true;
      }
    };
    this.userAvatar =
      this.userAvatar === '' || (this.userAvatar as string).includes('s.gravatar')
        ? this.downloadService.defaultLogo
        : this.userAvatar;
  }

  onHome() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([LANDING_ROUTE]));
  }

  onDiscover() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([PROJECT_ROUTE]));
  }

  onApply() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([APPLY_ROUTE]));
  }

  onDonate() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([DONATE_ROUTE]));
  }

  // onLogIn() {
  //   this.isCollapsed = true;
  //   this.store.dispatch(new TriggerLoginAction(['/']));
  // }

  onLogIn() {
    // this.isCollapsed = true;
    this.authService.login();
  }

  onLogOut() {
    this.authService.logout();
  }

  onMyProjects() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([`${ACCOUNT_ROUTE}/projects`]));
  }

  // onMySubscriptions() {
  //   this.isCollapsed = true;
  //   this.store.dispatch(new GoAction([`${ACCOUNT_ROUTE}/subscriptions`]));
  // }

  onMyProfile() {
    this.isCollapsed = true;
    this.store.dispatch(new GoAction([`/profile`]));
  }

  goToPage(url: string, fragment?: string, external?: boolean) {
    if (external) {
      window.open(url, '_self');
    } else {
      this.router.navigate([url], { fragment: fragment });
    }
  }

  goToFundingURL() {
    const projectId = readParameterFromRouterState(this.state, 'id');
    if (projectId) {
      this.projectService.getProject(projectId).subscribe(project => {
        if (project.slug || project.fundspringProjectId) {
          const identity = project.slug || project.fundspringProjectId;
          window.location.href = environment.FUNDSPRING_URL + '/projects/' + identity;
        } else {
          window.location.href = environment.FUNDSPRING_URL;
        }
      });
      return;
    }
    window.location.href = environment.FUNDSPRING_URL;
  }
}
