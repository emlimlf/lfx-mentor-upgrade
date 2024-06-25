// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { LocationStrategy } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { factoryLog } from '@app/services/debug.service';
import { AuthService } from './services/auth.service';
// import '@datadog/browser-rum/bundle/datadog-rum';
import { environment } from 'environments/environment';
import { LfxHeaderService } from './services/lfx-header.service';
import { UserService } from './services/user.service';
import * as querystring from 'query-string';
const log = factoryLog('AppComponent');
// const { DD_RUM: datadog } = window as any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  private isPopState = false;
  userName = '';
  userAvatar: any = '';
  userEmail = '';
  url = '/404';
  authError = false;
  loadState = true;
  isLandingPage = true;

  constructor(
    private router: Router,
    public locationStrategy: LocationStrategy,
    private lfxheader: LfxHeaderService,
    public auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    //this.initDatadogRUM();
    // Setup user related settings
    this.userSettings();

    // This code fixes a common issue with SPA's, where changes to the route don't scroll to
    // the top of the page like on traditional websites.
    // https://github.com/angular/angular/issues/7791
    this.locationStrategy.onPopState(() => {
      this.isPopState = true;
    });
    let oldUrl = '';
    this.router.events.subscribe(event => {
      const urlPath = querystring.parseUrl(this.locationStrategy.path(false));
      this.isLandingPage = urlPath.url === '/';

      // Scroll to top if accessing a page, not via browser history stack
      if (event instanceof NavigationEnd && !this.isPopState) {
        const newUrl = event.urlAfterRedirects.split('?')[0];
        if (oldUrl !== newUrl) {
          window.scrollTo(0, 0);
        }
        oldUrl = newUrl;
        this.isPopState = false;
      }

      // Ensures that isPopState is reset
      if (event instanceof NavigationEnd) {
        this.isPopState = false;
        // To verify the Url is not 404.
        this.url = event.urlAfterRedirects;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (document.getElementById('lfx-header')) {
        const lfxHeader = document.getElementById('lfx-header');

        if (lfxHeader && lfxHeader.shadowRoot) {
          const elements: NodeListOf<Element> = lfxHeader.shadowRoot.querySelectorAll('.links li a');
          elements.forEach((el: Element) => {
            if (el && el.textContent) {
              const id = el && el.textContent.replace(/ /g, '');
              el.setAttribute('id', id.toLowerCase());
            }
          });
        }
      }
    }, 1000);
  }

  private userSettings() {
    this.auth.userProfile$.subscribe(userProfile => {
      if (userProfile) {
        this.loadState = false;
        // Tweak to allow user service to set the local storage before accessing other endpoints.
        setTimeout(() => {
          this.userService.loginUser().subscribe(
            result => {
              localStorage.clear();
              localStorage.setItem('isLoggedIn', 'true');

              // Set local storage flags and skills list if user is mentor/apprentice
              const userId = result.id;

              this.userName = result.lfid;
              this.userEmail = result.email;
              localStorage.setItem('userId', userId);

              // if (datadog) {
              //   datadog.setUser({
              //     id: result.lfid,
              //   });
              // }

              if (result.profiles) {
                for (const profile of result.profiles) {
                  if (profile.type === 'mentor') {
                    localStorage.setItem('isMentor', 'true');
                    localStorage.setItem('mentorSkills', profile.skillSet.skills);
                  }
                  if (profile.type === 'apprentice') {
                    localStorage.setItem('isApprentice', 'true');
                    localStorage.setItem('apprenticeSkills', profile.skillSet.skills);
                    localStorage.setItem('apprenticeImprovementSkills', profile.skillSet.improvementSkills);
                  }
                }
              }
              this.loadState = true;
            },
            (err: any) => {
              console.log(err);
            }
          );
        }, 500);
      } else {
        localStorage.clear();
      }
    });
  }

  // private initDatadogRUM() {
  //   if (datadog && environment.datadogEnv) {
  //     datadog.init({
  //       applicationId: '3f039925-b373-433f-b201-6dde5b511ce2',
  //       clientToken: 'pub4884a4fef6e43d9448d1b3e4dbfdddfa',
  //       site: 'datadoghq.com',
  //       service: 'mentorship',
  //       env: environment.datadogEnv,
  //       sessionSampleRate: 100,
  //       sessionReplaySampleRate: 20,
  //       trackUserInteractions: true,
  //       trackResources: true,
  //       trackLongTasks: true,
  //       defaultPrivacyLevel: 'allow',
  //     });
  //     datadog.startSessionReplayRecording();
  //     console.log('initialized datadog rum');
  //   }
  // }
}
