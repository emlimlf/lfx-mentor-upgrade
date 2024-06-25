import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-secondary-tabs',
  templateUrl: './nav-secondary-tabs.component.html',
  styleUrls: ['./nav-secondary-tabs.component.scss'],
})
export class NavSecondaryTabsComponent implements OnInit {
  activeId = 'hidden-secondary-tab';

  constructor(private router: Router, public auth: AuthService, private projectService: ProjectService) {}

  ngOnInit() {
    setTimeout(() => {
      this.setupTabSelection();
    });
  }

  onTabChange(event: NgbTabChangeEvent) {
    if (event.activeId !== event.nextId && event.activeId !== 'hidden-secondary-tab') {
      switch (event.nextId) {
        // case 'featured-secondary-tab':
        //   this.onClickChangePageState('featured');
        //   break;
        case 'projects-secondary-tab':
          this.onClickChangePageState('projects');
          break;
        case 'mentors-secondary-tab':
          this.onClickChangePageState('mentors');
          break;
        case 'mentees-secondary-tab':
          this.onClickChangePageState('mentees');
          break;
        case 'my-mentorships-secondary-tab':
          this.onClickChangePageState('my-mentorships');
          break;
        case 'my-tasks-secondary-tab':
          this.onClickChangePageState('my-tasks');
          break;
        case 'my-account-secondary-tab':
          this.onClickChangePageState('my-account');
          break;
      }
    }
  }

  onClickChangePageState(tab: string) {
    this.router.navigate(['/'], { fragment: tab });
  }

  isAlpha(word: any): Boolean {
    const letters = new RegExp(/^[A-Za-z]+$/);
    return letters.test(word);
  }

  isGUID(word: any) {
    const letters = new RegExp(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/);
    return letters.test(word);
  }

  getPID(segments: string[]): string {
    let Id = '';
    for (let i = 0; i < segments.length; i++) {
      if (this.isGUID(segments[i])) {
        Id = segments[i];
      }
    }
    return Id;
  }

  private setupTabSelection() {
    if (this.router.url.includes('/project')) {
      this.activeId = 'projects-secondary-tab';
      this.auth.isAuthenticated$.subscribe(loggedIn => {
        if (loggedIn && !this.router.url.includes('project/applied')) {
          const urlSegments = this.router.url.includes('/participate/mentee')
            ? this.router.url.split('=')
            : this.router.url.split('/');
          //Get a real GUID for this endpoint call
          const projectId = this.getPID(urlSegments);
          if (projectId) {
            this.projectService.getProjectUserRoles(projectId).subscribe(roles => {
              if (
                roles.length > 0 &&
                (roles.indexOf('maintainer') > -1 || roles.indexOf('mentor') > -1 || roles.indexOf('apprentice') > -1)
              ) {
                this.activeId = 'my-mentorships-secondary-tab';
              }
            });
          }
        }
      });
    }

    if (this.router.url.includes('/mentee')) {
      this.activeId = 'mentees-secondary-tab';
    }

    if (this.router.url.includes('/mentor')) {
      this.activeId = 'mentors-secondary-tab';
    }

    if (this.router.url.includes('/edit')) {
      this.activeId = 'my-mentorships-secondary-tab';
    }

    if (this.router.url.includes('/mentee/edit') || this.router.url.includes('/mentor/edit')) {
      this.activeId = 'my-account-secondary-tab';
    }

    this.selectTabOnRouterNavigation();
  }

  private selectTabOnRouterNavigation() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('/project')) {
          this.activeId = 'projects-secondary-tab';

          this.auth.isAuthenticated$.subscribe(loggedIn => {
            if (loggedIn && !this.router.url.includes('project/applied')) {
              const urlSegments = this.router.url.split('/');
              const projectId = urlSegments[urlSegments.findIndex(x => x === 'project') + 1];
              if (projectId) {
                this.projectService.getProjectUserRoles(projectId).subscribe(roles => {
                  if (
                    roles.length > 0 &&
                    (roles.indexOf('maintainer') > -1 ||
                      roles.indexOf('mentor') > -1 ||
                      roles.indexOf('apprentice') > -1)
                  ) {
                    this.activeId = 'my-mentorships-secondary-tab';
                  }
                });
              }
            }
          });
        }

        if (event.urlAfterRedirects.includes('/mentee')) {
          this.activeId = 'mentees-secondary-tab';
        }

        if (event.urlAfterRedirects.includes('/mentor')) {
          this.activeId = 'mentors-secondary-tab';
        }

        if (event.urlAfterRedirects.includes('/edit')) {
          this.activeId = 'my-mentorships-secondary-tab';
        }

        if (event.urlAfterRedirects.includes('/mentee/edit') || event.urlAfterRedirects.includes('/mentor/edit')) {
          this.activeId = 'my-account-secondary-tab';
        }
      }
    });
  }
}
