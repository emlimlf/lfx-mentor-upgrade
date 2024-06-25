// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QueueAlertAction, AlertType, CoreState } from '@app/core';
import { Store } from '@ngrx/store';
import { UserService } from '@app/services/user.service';
import { ProjectMemberStatus, ProjectMemberStatusArray } from '@app/models/project.model';
import { MenteeService } from '@app/services/mentee.service';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { TIME_FORMAT_24_HOURS } from '@app/core/constants';
import { factoryLog } from '@app/services/debug.service';
import { UserRoles } from '@app/models/user.model';
const log = factoryLog('MenteeApplicationsComponent');

@Component({
  selector: 'app-mentee-applications',
  templateUrl: './mentee-applications.component.html',
  styleUrls: ['./mentee-applications.component.scss'],
})
export class MenteeApplicationsComponent implements OnInit, OnDestroy {
  profileId = '';
  projectId = '';
  destroy$ = new Subject<void>();
  isLoaded = false;
  applications: any[] = [];
  endApplications: any[] = [];
  allApplications: any[] = [];
  statusFilter = '';
  sortColumn = '';
  sortDirection = '';

  filters = [
    {
      label: 'Status',
      field: 'status',
      options: ProjectMemberStatusArray,
      value: '',
    },
  ];

  constructor(
    private store: Store<CoreState>,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private menteeService: MenteeService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.activeRoute.parent || !this.activeRoute.parent.params) {
      this.returnToPublicDetails();
      return;
    }

    this.activeRoute.parent.params.subscribe(routeParams => {
      const routeId = routeParams.id as string;
      this.profileId = routeId.split(',')[0];
      this.projectId = routeId.split(',')[1];

      this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(loggedIn => {
        if (!loggedIn) {
          return this.returnToPublicDetails();
        }
        this.isLoaded = false;
        forkJoin(
          this.userService.getUserRelationships(this.profileId),
          this.menteeService.getMenteeApplications(this.profileId),
          this.menteeService.getMenteeEndApplications(this.profileId)
        )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            ([relationships, applications, endApplications]) => {
              relationships = relationships || [];
              this.allApplications = applications || [];
              this.endApplications = endApplications || [];

              this.allApplications = this.allApplications.map(app =>
                this.castRawApplication({ ...app }, relationships)
              );
              this.endApplications = this.endApplications.map(app =>
                this.castRawApplication({ ...app }, relationships)
              );

              const isAllowed = !!relationships.find(r => this.isAdmin(r.myRole));
              if (!isAllowed) {
                return this.returnToPublicDetails();
              }

              this.applications = this.allApplications;
              this.isLoaded = true;
            },
            () => {
              this.isLoaded = true;
            }
          );
      });
    });
  }

  castRawApplication(app: any, relationships: any) {
    app.createdOnDate = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleDateString();
    app.createdOnTime = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);
    app.updatedOnDate = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleDateString();
    app.updatedOnTime = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);

    const relationship = relationships.find((r: any) => this.isMentee(r.theirRole) && r.projectId === app.projectId);

    if (relationship && relationship.myRole === UserRoles.Maintainer) {
      app.related = !!(relationship && this.isAdmin(relationship.myRole));
    }

    return app;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  returnToPublicDetails() {
    // no need to wait for the applications endpoint to finish
    this.destroy$.next();

    this.router.navigate(['/mentee/' + this.profileId + ',' + this.projectId]);
  }

  filterChanged($event: any) {
    const filter = this.filters.find(f => f.field === $event.field);
    if (filter) {
      filter.value = $event.value;
      if ($event.value) {
        this.applications = this.allApplications.filter(a => a.status === $event.value);
      } else {
        this.applications = this.allApplications;
      }
      this.applySort();
    }
  }

  onStatusChange(application: any, newStatus: ProjectMemberStatus) {
    application.status = newStatus;

    this.projectService
      .updateProjectMemberStatus(application.projectId, this.profileId, newStatus, application.programTermId || '')
      .subscribe(res => {
        if (res && res.updatedOn) {
          application.updatedOnDate = new Date(res.updatedOn.replace(/-/g, '/') || '').toLocaleDateString();
          application.updatedOnTime = new Date(res.updatedOn.replace(/-/g, '/') || '').toLocaleTimeString(
            [],
            TIME_FORMAT_24_HOURS
          );
        }
        this.store.dispatch(
          new QueueAlertAction({ alertText: 'Member status updated.', alertType: AlertType.SUCCESS })
        );
      });
  }

  isMentee(role: string): boolean {
    return this.userService.isMentee(role);
  }

  isAdmin(role: string): boolean {
    return this.userService.isMentor(role) || this.userService.isMaintainer(role);
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  sortFunction = (a: any, b: any) => {
    const aValue = a[this.sortColumn].toString().toLowerCase(),
      bValue = b[this.sortColumn].toString().toLowerCase();
    let ret = 0;
    if (aValue < bValue) {
      ret = -1;
    } else if (aValue > bValue) {
      ret = 1;
    }
    return this.sortDirection === 'asc' ? ret : -ret;
  };

  applySort() {
    this.applications.sort(this.sortFunction);
  }
}
