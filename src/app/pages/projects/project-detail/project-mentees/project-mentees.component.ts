// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { Profile } from '@app/models/user.model';
import { Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  ProjectMemberStatusArray,
  ProjectMemberStatus,
  Project,
  MenteeResponse,
  ExpiredApplication,
  ProgramTerm,
} from '@app/models/project.model';
import { Store } from '@ngrx/store';
import { CoreState, QueueAlertAction, AlertType } from '@app/core';
import { DownloadService } from '@app/services/download.service';
import { TIME_FORMAT_24_HOURS } from '@app/core/constants';
import { factoryLog } from '@app/services/debug.service';
import { to } from 'await-to-js';
const log = factoryLog('ProjectMenteesComponent');

const MAX_EMAIL_CHARS = 1500;

interface ExpiredFilter {
  index: number;
  filters: TableFilter[];
}
interface TableFilter {
  label: 'Filter by Status';
  field: 'status';
  options: any[];
  value: '';
  id: number;
}

const MENTEE_STATUS = {
  ACCEPTED: 'accepted',
  PENDING: 'pending',
};

@Component({
  selector: 'app-project-mentees',
  templateUrl: './project-mentees.component.html',
  styleUrls: ['./project-mentees.component.scss'],
})
export class ProjectMenteesComponent implements OnInit, OnDestroy {
  project$ = new Subject<Project>();
  Mentees$ = new Subject<MenteeResponse>();
  expiredApplications$ = new Subject<ExpiredApplication[]>();
  expiredApplications: any;
  allExpiredApplications: any;
  expiredAppsFilters: {
    [key: string]: {
      sortDirection: string;
      sortColumn: string;
      hasMentees: boolean;
    };
  } = {};

  @ViewChild('modal') modal?: ElementRef;
  privateProfiles: Profile[] = [];
  projectId = '';
  message = '';
  hasMentees: any;
  isAdmin: any;
  isMentor: any;
  isMaintainer: any;
  project: Project = {} as Project;
  applications: any[] = [];
  emails: string[] = [];
  allApplications: any[] = [];
  destroy$ = new Subject<void>();
  statusFilter = '';
  sortColumn = '';
  sortDirection = '';

  filterState = {
    active: 'active',
    past: 'past',
  };

  filters = [
    {
      label: 'Filter by Status',
      field: 'status',
      options: ProjectMemberStatusArray,
      value: '',
    },
  ];
  pastFilters = [
    {
      label: 'Filter by Status',
      field: 'status',
      options: ProjectMemberStatusArray,
      value: '',
    },
  ];
  expiredFilters: ExpiredFilter[] = [];
  tableFilter: TableFilter[] = [];
  profiles: any[] = [];
  nextPageKey$ = new BehaviorSubject<string>('');
  shouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  isPageLoaded = false;
  isStatusReadOnly = false;
  programTerms: ProgramTerm[] = [];

  constructor(
    private router: Router,
    private store: Store<CoreState>,
    private activeRoute: ActivatedRoute,
    private projectService: ProjectService,
    private downloadService: DownloadService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.nextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextButton$);
    if (!this.activeRoute.parent || !this.activeRoute.parent.params) {
      this.returnToPublicDetails();
      return;
    }

    this.activeRoute.parent.params.subscribe(routeParams => {
      this.privateProfiles = [];
      this.projectId = routeParams.id;
      this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(loggedIn => {
        if (!loggedIn) {
          return this.returnToPublicDetails();
        }

        this.projectService.getProject(this.projectId).subscribe(this.project$);
        this.projectService.getAllProjectMentees(this.projectId, '9').subscribe(this.Mentees$);
        this.projectService.getProjectExpiredApplications(this.projectId).subscribe(this.expiredApplications$);
        this.isPageLoaded = false;
        forkJoin(this.project$, this.Mentees$, this.expiredApplications$)
          .pipe(
            map(([project, mentees, expiredApplications]) => {
              return { project, mentees, expiredApplications };
            })
          )
          .subscribe(
            res => {
              this.project = res.project;
              this.programTerms = res.project.programTerms;
              const mentees = res.mentees;
              this.allApplications = this.filterMentees(this.project.programTerms, mentees.mentees) || [];

              console.log('Applications');
              if (res.expiredApplications) {
                this.expiredApplications = {};
                this.expiredApplications = this.constructExpiredApps(res.expiredApplications);
                this.allExpiredApplications = { ...this.expiredApplications };
                // for (let apps in this.allExpiredApplications) {
                //   this.expiredFilters.push(this.pastFilters);
                // }
              }
              this.nextPageKey$.next(mentees.nextPageKey);
              this.setApplication();
              this.isPageLoaded = true;
            },
            err => {
              this.isPageLoaded = true;
            }
          );

        this.projectService.getProjectUserRoles(this.projectId).subscribe(roles => {
          this.isMaintainer = roles.indexOf('maintainer') > -1;
          this.isMentor = roles.indexOf('mentor') > -1;
          this.isAdmin = this.isMaintainer || this.isMentor;

          if (!this.isMaintainer) {
            this.isStatusReadOnly = true;
          }

          if (this.isAdmin) {
            this.projectService.getProjectPrivateMentees(this.projectId).subscribe(profiles => {
              this.privateProfiles = profiles;
            });
          }
        });
      });
    });
  }

  filterMentees(programTerms: any, mentees: any) {
    const filteredMentees = mentees.filter((mentee: any) => {
      const termId = mentee.programTermId;
      const term = this.getTerm(programTerms, termId);
      if (term) {
        // const today = new Date();
        // const termStartDate = new Date(+term.startDateTime * 1000);
        // const termEndDate = new Date(+term.endDateTime * 1000);

        // if (today < termStartDate || today < termEndDate) {
        //   return true;
        // }

        if (term.Active === 'open') {
          return true;
        }
      }
    });
    this.hasMentees = filteredMentees.length > 0;
    return filteredMentees;
  }

  getTerm(programTerms: any, termId: string) {
    const termObject = programTerms.find((term: any) => {
      return term.id === termId;
    });
    return termObject;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClickNextBtn() {
    const pageKey = this.nextPageKey$.getValue();
    if (!pageKey) {
      return;
    }

    this.projectService
      .getAllProjectMentees(this.projectId, '9', pageKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.allApplications = this.allApplications.concat(
          this.filterMentees(this.project.programTerms, results.mentees)
        );
        this.hasMentees = this.allApplications.length > 0;
        this.nextPageKey$.next(results.nextPageKey);
        this.setApplication();
      });
  }

  setApplication() {
    this.allApplications.forEach(app => {
      app.name = app.firstName + ' ' + app.lastName;
      app.createdOnDate = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleDateString();
      app.createdOnTime = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);
      app.updatedOnDate = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleDateString();
      app.updatedOnTime = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);

      if (!app.logoUrl) {
        app.logoUrl = this.downloadService._defaultLogo({ first: app.name, last: '' });
      }
    });
    this.applications = this.allApplications;
  }

  filterChanged($event: any, id?: string) {
    const { filter, field, value, state } = $event;

    if (filter) {
      filter.value = value;

      if (value) {
        switch (state) {
          case this.filterState.active:
            this.sortColumn = field;
            this.applications = [...this.allApplications].filter(a => a.status === value);
            break;
          case this.filterState.past:
            if (id) {
              this.expiredAppsFilters[id].sortColumn = field;
              this.expiredApplications[id] = [...this.allExpiredApplications[id]].filter(
                (a: any) => a.status === value
              );
            }
            break;
        }
      } else {
        switch (state) {
          case this.filterState.active:
            this.applications = [...this.allApplications];
            break;
          case this.filterState.past:
            if (id) {
              this.expiredApplications[id] = [...this.allExpiredApplications[id]];
            }
            break;
        }
      }
      this.hasMentees = this.applications.length > 0;
      this.applySort(id);
    }
  }

  sort(column: string, id?: string) {
    const sortColumn = id ? this.expiredAppsFilters[id].sortColumn : this.sortColumn;
    if (sortColumn === column) {
      if (id) {
        this.expiredAppsFilters[id].sortDirection =
          this.expiredAppsFilters[id].sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      }
    } else {
      if (id) {
        this.expiredAppsFilters[id].sortColumn = column;
        this.expiredAppsFilters[id].sortDirection = 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    }
    this.applySort(id);
  }

  sortFunction = (id?: string) => {
    return (a: any, b: any) => {
      const sortColumn = id ? this.expiredAppsFilters[id].sortColumn : this.sortColumn;
      const sortDirection = id ? this.expiredAppsFilters[id].sortDirection : this.sortDirection;
      const aValue = a[sortColumn].toString().toLowerCase(),
        bValue = b[sortColumn].toString().toLowerCase();
      let ret = 0;
      if (aValue < bValue) {
        ret = -1;
      } else if (aValue > bValue) {
        ret = 1;
      }
      return sortDirection === 'asc' ? ret : -ret;
    };
  };

  applySort(id?: string) {
    if (id) {
      this.expiredApplications[id].sort(this.sortFunction(id));
    } else {
      this.applications.sort(this.sortFunction());
    }
  }

  openConfirm(confirmTemplate: any) {
    return new Promise((resolve, reject) => {
      this.modalService.open(confirmTemplate, { centered: true, windowClass: 'no-border modal-window' }).result.then(
        result => {
          log('openConfirm result', { result });
          resolve(result);
        },
        err => reject(err)
      );
    });
  }

  async onStatusChange(application: any, newStatus: ProjectMemberStatus, confirmTemplate: any) {
    log('entered onStatusChange', { application, newStatus });

    if (application.status === newStatus) {
      return;
    }

    if (newStatus === MENTEE_STATUS.ACCEPTED) {
      const [err, result] = await to(this.openConfirm(confirmTemplate));
      if (err) {
        return;
      }

      if (result !== 'CONFIRM') {
        log('No confirmed');
        return;
      }
    }

    log('Updating Status');

    application.status = newStatus;

    this.projectService
      .updateProjectMemberStatus(this.projectId, application.userId, newStatus, application.programTermId)
      .subscribe(res => {
        if (res && res.updatedOn) {
          application.updatedOnTime = new Date(res.updatedOn.replace(/-/g, '/') || '').toLocaleTimeString(
            [],
            TIME_FORMAT_24_HOURS
          );
          application.updatedOnDate = new Date(res.updatedOn.replace(/-/g, '/') || '').toLocaleDateString();

          this.applications.map(app => {
            if (application.userId === app.userId) {
              app.updatedOn = res.updatedOn;
              app.updatedOnTime = application.updatedOnTime;
              app.updatedOnDate = application.updatedOnDate;
            }
          });

          this.allApplications.map(app => {
            if (application.userId === app.userId) {
              app.updatedOn = res.updatedOn;
              app.updatedOnTime = application.updatedOnTime;
              app.updatedOnDate = application.updatedOnDate;
            }
          });
        }
        this.store.dispatch(
          new QueueAlertAction({ alertText: 'Member status updated.', alertType: AlertType.SUCCESS })
        );
      });
  }

  returnToPublicDetails() {
    // no need to wait for the applications endpoint to finish
    this.destroy$.next();
    this.router.navigate(['/project/' + this.projectId]);
  }

  bulkMail(event: any) {
    switch (event) {
      case 'filtered':
        this.beginBulkEmailing(this.applications);
        break;
      case 'all':
        this.beginBulkEmailing(this.allApplications);
        break;
    }
  }

  export(event: any) {
    switch (event) {
      case 'filtered':
        this.beginCSVExport(this.applications);
        break;
      case 'all':
        this.beginCSVExport(this.allApplications);
        break;
    }
  }
  temp: any[] = [];
  merge(obj1: any[], obj2: any[]) {
    this.temp = [];
    obj1.forEach(x => {
      obj2.forEach(y => {
        if (x.userId === y.userId) {
          this.temp.push({ ...x, ...y });
        }
      });
    });
    return this.temp;
  }

  beginCSVExport(applicants: any[]) {
    if (this.privateProfiles.length > 0) {
      const export_data = this.merge(this.privateProfiles, applicants);
      const sortedExports = export_data.sort(function(a, b) {
        return a.lastName > b.lastName ? 1 : a.lastName < b.lastName ? -1 : 0;
      });
      this.downloadService.downloadFile(sortedExports, 'jsontocsv', 'mentees');
    }
  }

  beginBulkEmailing(applicants: any[]) {
    if (this.privateProfiles.length > 0) {
      const mentees = this.merge(this.privateProfiles, applicants);
      this.emails = [];
      mentees.forEach(r => {
        this.emails.push(r.email);
      });
      const recipients = this.emails.join(';');
      const url = `mailto:${recipients}`;

      if (this.emails.length > 100) {
        this.open('Maximum Email Addresses Exceeded (100 Max)');
      } else if (this.emails.length <= 100 && url.length <= MAX_EMAIL_CHARS) {
        window.open(url, '_tab');
      } else if (url.length > MAX_EMAIL_CHARS) {
        this.open('Maximum Email Request Size Exceeded (1500 Characters Max)');
      }
    }
  }

  open(message: string) {
    this.activeModal = this.modalService.open(this.modal, { centered: true, windowClass: 'no-border modal-window' });
    this.message = message;
  }

  constructExpiredApps(applicationArray: ExpiredApplication[]) {
    applicationArray = applicationArray.map(app => {
      app.name = app.menteeFirstName + ' ' + app.menteeLastName;
      app.createdOnDate = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleDateString();
      app.createdOnTime = new Date(app.createdOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);
      app.updatedOnDate = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleDateString();
      app.updatedOnTime = new Date(app.updatedOn.replace(/-/g, '/') || '').toLocaleTimeString([], TIME_FORMAT_24_HOURS);
      return app;
    });

    const unique = applicationArray.reduce(function(r, a) {
      r[a.programTermId] = r[a.programTermId] || [];
      r[a.programTermId].push(a);
      return r;
    }, Object.create(null));

   

    this.expiredFilters = [];
    let count = 0 as number;
    Object.keys(unique).filter((obj: string) => {
      this.tableFilter = [];
      this.tableFilter.push({
        label: 'Filter by Status',
        field: 'status',
        options: ProjectMemberStatusArray,
        value: '',
        id: count,
      });
      this.expiredFilters.push({ index: count, filters: this.tableFilter });
      count++;
      this.expiredAppsFilters[obj] = { sortDirection: '', sortColumn: '', hasMentees: true };
    });
    return unique;
  }
}
