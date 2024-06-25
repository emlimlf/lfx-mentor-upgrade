// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-mentee',
  templateUrl: './mentee.component.html',
  styleUrls: ['./mentee.component.scss'],
})
export class MenteeComponent implements OnInit, OnDestroy {
  @ViewChild('stickyMarker', { static: true }) stickyMarker!: ElementRef;

  // Profile information
  profileId = '';
  profile: any = {};
  profileLoaded = false;

  profileEmail: any = '';
  profilePhone: any = '';
  profileExtrasLoaded = false;

  userIsMenteeAdmin = false;
  isScrolled = false;

  destroy$ = new Subject<void>();

  menteeLogo = '/assets/apprentice.svg';
  routeId = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.routeId = routeParams.id as string;
      this.profileId = this.routeId.split(',')[0];

      // assume we will only use public data for the mentee
      this.userService
        .getProfileByType(this.profileId, 'apprentice')
        .pipe(takeUntil(this.destroy$))
        .subscribe(results => {
          this.profile = results;

          this.profile.logoUrl = this.profile.logoUrl
            ? this.profile.logoUrl
            : this.downloadService._defaultLogo({ first: this.profile.firstName, last: this.profile.lastName });

          this.profileLoaded = true;
        });

      this.authService.isAuthenticated$
        .pipe(
          filter(Boolean),
          switchMap(() => this.userService.canUserViewMenteeTasks(this.profileId)),
          takeUntil(this.destroy$)
        )
        .subscribe(userIsMenteeAdmin => {
          // if the User is the Mentee we are viewing, treat this as a public page
          if (this.profileId === localStorage.getItem('userId')) {
            this.userIsMenteeAdmin = false;
          }
          // otherwise use the result of the API based check
          else {
            this.userIsMenteeAdmin = userIsMenteeAdmin;
          }

          // load the mentee private data (including contact info)
          if (this.userIsMenteeAdmin) {
            this.userService
              .getPrvProfileByType(this.profileId, 'apprentice')
              .pipe(takeUntil(this.destroy$))
              .subscribe(results => {
                this.profileEmail = results.email;
                this.profilePhone = results.phone;
                this.profileExtrasLoaded = true;
              });
          }
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  stringToDate(dateValue: string) {
    if (dateValue) {
      const d = new Date(dateValue.slice(0, 10));
      return d;
    }
    return false;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.stickyMarker) {
      const marker = this.stickyMarker.nativeElement as HTMLElement;
      const top = marker.offsetTop;
      this.isScrolled = window.pageYOffset > top;
    }
  }
}
