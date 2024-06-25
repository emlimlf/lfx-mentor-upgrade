import { to } from 'await-to-js';

import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService, ProjectApplication, GetApplicationsRequest } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';

import { factoryLog } from '@app/services/debug.service';
import { Profile } from '@app/models/user.model';
import { DownloadService } from '@app/services/download.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProgramTerm, ProjectMemberStatusArray } from '@app/models/project.model';
import { MenteesTabAddTasksComponent } from '../mentees-tab-add-tasks/mentees-tab-add-tasks.component';
import { ApprenticeProjectTasksSection } from '@app/shared/tasks/tasks/tasks.component';
import { SubmitState } from '@app/shared';
import { Store } from '@ngrx/store';
import { CoreState, QueueAlertAction, AlertType } from '@app/core';
import { forkJoin } from 'rxjs';
import { TaskService } from '@app/services/task.service';

const log = factoryLog('MenteesTabComponent');

@Component({
  selector: 'app-mentees-tab',
  templateUrl: './mentees-tab.component.html',
  styleUrls: ['./mentees-tab.component.scss'],
})
export class MenteesTabComponent implements OnInit, OnDestroy {
  @Input() projectID = '';
  @Input() programTerms: ProgramTerm[] = [];
  @ViewChild('info') downloadInfo?: ElementRef;

  applications: ProjectApplication[] = [];

  firstPage = 0;
  currentIndex = 0;
  pageSize = 10;
  isTableLoading = true;
  cursors = [''];
  applicationCountStart = 0;
  applicationCountEnd = 0;

  downloadAllowed: any = false;
  profiles: Profile[] = [];
  DEFAULT_FILTER_TITLE = 'Filter by Application Status';
  DEFAULT_DOWNLOAD_FILTER_TITLE = 'Download Mentees by Status';
  @ViewChild('next') nextButton: ElementRef | null = null;
  filterTitle: string = this.DEFAULT_FILTER_TITLE;
  downloadFilterTitle: string = this.DEFAULT_DOWNLOAD_FILTER_TITLE;
  modalMessage: string = '';
  activeMentees: ApprenticeProjectTasksSection[] = [];
  applicationsClone: any[] = [];
  submittedAssignees: string[] = [];

  filters = [
    {
      label: 'Status',
      field: 'status',
      options: ProjectMemberStatusArray,
      value: '',
    },
  ];

  menteesListFilter: string = '';

  currentStatusFilter = '';

  isAdmin = false;
  isViewOnly = this.setViewOnly();
  isPastMenteeList = this.setPastMenteeList();
  modalRef!: NgbModalRef;
  disableButtons = false;
  isAddTasksDisabled = false;
  declineEnabled = false;
  reloadTasksForAssignee = { assigneeId: '' };

  constructor(
    private downloadService: DownloadService,
    private store: Store<CoreState>,
    private authService: AuthService,
    private taskService: TaskService,
    private modalService: NgbModal,
    private router: Router,
    private projectService: ProjectService
  ) {}

  setViewOnly() {
    const isViewOnly = this.setPastMenteeList();

    return isViewOnly;
  }

  setPastMenteeList() {
    const url = window.location.href;
    return url.includes('mentees-past');
  }

  async ngOnInit() {
    log('ngOnInit ');
    await this.getAuthorization();
    await this.getSubmittedAssignees(this.projectID);
    this.getApplications(this.currentIndex);
    this.getUserRoles();
    this.prePopulateActiveMentees();
    this.setAddTaskDisabled();
  }

  async getAuthorization() {
    log('entered getAuthorization');

    const [err] = await to(this.authService.isAuthenticated$.toPromise());
    if (err) {
      this.router.navigate(['/project/' + this.projectID]);
      return;
    }

    return true;
  }

  async getSubmittedAssignees(projectId: string) {
    log('getSubmittedAssignees entered');
    const [err, response] = await to(this.taskService.getSubmittedAssignees(projectId).toPromise());
    if (err || !response) {
      log('error ', { err });
      return;
    }
    this.submittedAssignees = response || [];
  }

  async getApplications(index: number, status = '') {
    log('entered getApplications', { index, cursor: this.cursors[index] });
    // @info: this.cursors[index] === '' for the first page,
    // so we need valid by undefined
    if (this.cursors[index] === undefined) {
      log('next page not found');
      return;
    }

    this.isTableLoading = true;

    const request: GetApplicationsRequest = {
      limit: this.pageSize,
      nextPageKey: this.cursors[index],
      status,
      name: this.menteesListFilter.toLowerCase() || '',
      type: this.isPastMenteeList ? 'closed' : '',
    };

    const [err, response] = await to(this.projectService.getApplications(this.projectID, request).toPromise());
    if (err || !response) {
      log('error ', { err });
      this.isTableLoading = false;
      return;
    }

    this.applications = response.Data || [];
    this.currentIndex = index;
    // @info: don't block buttons here
    // if after filter the list is empty, user won't be able to change the status later
    // this.disableButtons = !this.applications.length;

    this.setNextButtonDisableStatus(response.NextPageKey);
    this.saveNextCursor(response.NextPageKey);
    this.setPageItemCounters();
    this.setDeclineState();
    this.isTableLoading = false;
    if (this.currentIndex !== 0) {
      this.scrollToTop();
    }
  }

  resetCursor() {
    this.cursors = [''];
  }

  saveNextCursor(nextCursor = '') {
    if (nextCursor && !this.cursors.includes(nextCursor)) {
      this.cursors.push(nextCursor);
    }
  }

  setNextButtonDisableStatus(nextCursor: string) {
    if (this.nextButton) {
      if (nextCursor === '') {
        (this.nextButton.nativeElement as HTMLButtonElement).disabled = true;
      } else {
        (this.nextButton.nativeElement as HTMLButtonElement).disabled = false;
      }
    }
  }

  setPageItemCounters() {
    if (!this.applications.length) {
      this.applicationCountStart = 0;
      this.applicationCountEnd = 0;
      return;
    }

    this.applicationCountStart = this.currentIndex * this.pageSize + 1;
    this.applicationCountEnd = this.applicationCountStart + this.applications.length - 1;
  }

  async clearSearch() {
    this.menteesListFilter = '';
    this.applyMenteesFilter();
  }

  async GetAllAcceptedApplications() {
    const request: GetApplicationsRequest = {
      limit: 999,
      status: 'accepted',
    };
    const [err, response] = await to(this.projectService.getApplications(this.projectID, request).toPromise());
    if (err || !response) {
      // @todo: display error message
      return [];
    }
    return response.Data || [];
  }
  async GetAllPendingApplications() {
    const request: GetApplicationsRequest = {
      limit: 999,
      status: 'pending',
    };
    const [err, response] = await to(this.projectService.getApplications(this.projectID, request).toPromise());
    if (err || !response) {
      // @todo: display error message
      return [];
    }
    return response.Data || [];
  }

  async setAddTaskDisabled() {
    log('entered setAddTaskDisabled');

    const [pending, accepted] = await Promise.all([
      this.GetAllPendingApplications(),
      this.GetAllAcceptedApplications(),
    ]);

    this.isAddTasksDisabled = !!accepted.length || !!pending.length;
  }

  async onUpdateMenteeStatus() {
    log('onUpdateMenteeStatus entered');
    this.setAddTaskDisabled();
    this.prePopulateActiveMentees();
    this.getSubmittedAssignees(this.projectID);
  }

  setDeclineState() {
    this.declineEnabled = this.applications.some(application => {
      return application.ApplicationStatus.includes('pending');
    })
      ? false
      : true;
  }

  async getUserRoles() {
    log('entered getUserRoles');
    const [, response] = await to(this.projectService.getProjectUserRoles(this.projectID).toPromise());

    const isAdminRole = ['maintainer', 'admin'];

    if (response) {
      this.isAdmin = response && response.some(role => isAdminRole.includes(role));
    }

    log('this.isAdmin ? ', { isAdmin: this.isAdmin });

    const canDownload = ['maintainer', 'admin', 'mentor'];

    this.downloadAllowed = response && response.some(role => canDownload.includes(role.toLowerCase()));

    // if (this.downloadAllowed) {
    //   const [, profiles] = await to(
    //     this.projectService.getProjectPrivateMentees(this.projectID, undefined, 'download').toPromise()
    //   );
    //   this.profiles = profiles as Profile[];
    // }

    return true;
  }

  async setFilterState() {
    this.currentStatusFilter = this.DEFAULT_FILTER_TITLE;

    const firstApplication = this.applications && this.applications[0];
    const allAllSameStatus = this.applications.every(
      application => application.ApplicationStatus === firstApplication.ApplicationStatus
    );

    if (firstApplication && allAllSameStatus) {
      this.currentStatusFilter = firstApplication.ApplicationStatus;
    }
    this.setAddTaskDisabled();
    this.setDeclineState();
  }

  async applyFilter(filter: any, option: string) {
    this.resetCursor();
    this.currentIndex = 0;

    this.filterTitle = option === '' ? this.DEFAULT_FILTER_TITLE : option;
    this.currentStatusFilter = option.toLowerCase();

    await this.getApplications(this.currentIndex, option.toLowerCase());

    // Fixes the issue JOB-1857 when the first page has mentees with same status.
    if (option !== '') {
      this.setFilterState();
    }
    this.setDeclineState();
  }

  async applyMenteesFilter() {
    this.resetCursor();
    this.currentIndex = 0;

    const status = this.getCurrentStatus();
    await this.getApplications(this.currentIndex, status);

    // Fixes the issue JOB-1857 when the first page has mentees with same status.
    if (this.menteesListFilter !== '') {
      this.setFilterState();
    }
    this.setDeclineState();
  }

  async downloadByFilter(option: string) {
    this.modalMessage = option;
    this.downLoadCachedMentees(option);
  }

  prePopulateActiveMentees() {
    const acceptedRequest: GetApplicationsRequest = {
      limit: 999,
      status: 'accepted',
    };
    const pendingRequest: GetApplicationsRequest = {
      limit: 999,
      status: 'pending',
    };
    let acceptedCall = this.projectService.getApplications(this.projectID, acceptedRequest);
    let pendingCall = this.projectService.getApplications(this.projectID, pendingRequest);
    this.activeMentees = [];
    forkJoin([acceptedCall, pendingCall]).subscribe(result => {
      let applications: ProjectApplication[] = [] as Array<ProjectApplication>;

      if (result[0].Data !== null && result[1].Data !== null) {
        applications = result[0].Data.concat(result[1].Data);
      } else if (result[0].Data !== null && result[1].Data === null) {
        applications = result[0].Data;
      } else if (result[0].Data === null && result[1].Data !== null) {
        applications = result[1].Data;
      }

      applications.forEach(({ MenteeID, MenteeName, ApplicationStatus }: any) => {
        this.activeMentees.push({
          apprenticeId: MenteeID,
          apprenticeName: MenteeName,
          apprenticeStatus: ApplicationStatus,
          apprenticeProjects: [],
        } as ApprenticeProjectTasksSection);
      });
    });
  }

  compare(a: any, b: any) {
    const menteeA = a.apprenticeName.toUpperCase();
    const menteeB = b.apprenticeName.toUpperCase();
    let comparison = 0;
    if (menteeA > menteeB) {
      comparison = 1;
    } else if (menteeA < menteeB) {
      comparison = -1;
    }
    return comparison;
  }

  merge(obj1: any[], obj2: any[]) {
    const temp: any[] = [];
    obj1.forEach(x => {
      obj2.forEach(y => {
        if (x.userId === y.MenteeID) {
          temp.push({ ...x, ...y });
        }
      });
    });
    return temp;
  }

  async downLoadMentees(filter: any) {
    const request: GetApplicationsRequest = {
      limit: 999,
      status: filter,
    };

    if (this.isPastMenteeList) {
      request.type = 'closed';
    }

    const [err, response] = await to(this.projectService.getApplications(this.projectID, request).toPromise());
    if (err) {
      // @todo: display error message
      return;
    }

    const applications = (response && response.Data) || [];

    if (!applications || !applications.length) {
      this.modalService.open(this.downloadInfo, { centered: true, windowClass: 'no-border modal-window', size: 'sm' });
      // @todo: display Message Empty list
      return;
    }

    if (this.profiles.length > 0 && this.downloadAllowed && applications.length > 0) {
      const data = this.merge(this.profiles, applications);
      const sortedExports = data.sort(function(a: any, b: any) {
        return a.lastName > b.lastName ? 1 : a.lastName < b.lastName ? -1 : 0;
      });

      this.downloadService.downloadFile(sortedExports, 'jsontocsv', 'mentees');
    }
  }

  downLoadCachedMentees(applicationStatus: any) {
    let termStatus = 'open';
    if (this.isPastMenteeList) {
      termStatus = 'closed';
    }
    this.projectService
      .downloadApplications(this.projectID, termStatus, applicationStatus, '0', '2000', 'lastName', 'asc')
      .toPromise()
      .then(applications => {
        if (!applications || applications.length < 1) {
          this.modalService.open(this.downloadInfo, {
            centered: true,
            windowClass: 'no-border modal-window',
            size: 'sm',
          });
          // @todo: display Message Empty list
          return;
        }
        if (this.downloadAllowed) {
          this.downloadService.downloadFile(applications, 'jsontocsv', 'mentees');
        }
      });
  }

  getCurrentStatus() {
    const status =
      this.currentStatusFilter !== '' && this.currentStatusFilter !== this.DEFAULT_FILTER_TITLE
        ? this.currentStatusFilter
        : '';
    return status;
  }

  goNext() {
    const nextIndex = this.currentIndex + 1;
    const status = this.getCurrentStatus();
    this.getApplications(nextIndex, status);
  }

  goPrevious() {
    const previousIndex = this.currentIndex - 1 || 0;
    this.getApplications(previousIndex, this.getCurrentStatus());
  }

  async addTask(event: any) {
    event.preventDefault();
    this.modalRef = this.modalService.open(MenteesTabAddTasksComponent, {
      ariaLabelledBy: 'Add Task',
      windowClass: 'task-modal',
      size: 'lg',
      backdrop: 'static',
    });
    this.modalRef.componentInstance.assignees$.next(this.activeMentees.sort(this.compare));

    const acceptedRequest: GetApplicationsRequest = {
      limit: 999,
      status: 'accepted',
    };
    const pendingRequest: GetApplicationsRequest = {
      limit: 999,
      status: 'pending',
    };

    this.modalRef.componentInstance.groupBy$.next('Project');
    this.modalRef.componentInstance.submitState$.next(SubmitState.READY);
    this.modalRef.componentInstance.initTask({ projectId: this.projectID, undefined });

    this.modalRef.componentInstance.added.subscribe((data: any) => {
      this.reloadTasksForAssignee = { assigneeId: data.assigneeId };
      this.store.dispatch(
        new QueueAlertAction({ alertText: 'Task Added Successfully !', alertType: AlertType.SUCCESS })
      );
    });

    // Handle Errors
    this.modalRef.componentInstance.error.subscribe((state: string) => {
      let errorMessage = '';
      switch (state) {
        case 'invalid':
          errorMessage = 'Failed to add task. Please complete the required fields';
          break;
        case 'runtime':
          errorMessage = 'Something went wrong while adding the task. Please retry again';
          break;
      }
      // Show errors on the pop-up instead.
      this.modalRef.componentInstance.errorOnSubmit = errorMessage;
      // this.store.dispatch(new QueueAlertAction({ alertText: errorMessage, alertType: AlertType.ERROR }));
    });

    // Auto Close Modal if Success
    this.modalRef.componentInstance.close.subscribe(() => {
      this.modalRef.close();
    });
  }

  openConfirmDecline(tpl: any) {
    return new Promise((resolve, reject) => {
      this.modalService.open(tpl, { centered: true, windowClass: 'no-border modal-window' }).result.then(
        result => {
          resolve(result);
        },
        err => reject(err)
      );
    });
  }

  getMenteesToDecline() {
    log('entered getMenteesToDecline');
    const currentMentees = this.applications || [];

    const currentPendingMenteesDisplayed = currentMentees
      .filter(item => item.ApplicationStatus === 'pending')
      .map(item => {
        return {
          ProgramTermID: item.ProgramTermID,
          UserID: item.MenteeID,
          ProjectID: item.ProjectID,
        };
      });

    return currentPendingMenteesDisplayed;
  }

  async confirmDeclinePendingApplications(tpl: any) {
    log('entered confirmDeclinePendingApplications', {});
    let err;
    let result;
    let updated;

    [err, result] = await to(this.openConfirmDecline(tpl));
    if (err || result !== 'CONFIRM') {
      log('No confirmed');
      return;
    }

    this.isTableLoading = true;

    const menteesToDeclined = this.getMenteesToDecline();

    [err, updated] = await to(
      this.projectService.declinePendingApplications(this.projectID, menteesToDeclined).toPromise()
    );
    if (err || !updated) {
      this.isTableLoading = false;
      return;
    }

    this.resetCursor();
    this.getApplications(this.firstPage, this.getCurrentStatus());
    this.setAddTaskDisabled();
    this.prePopulateActiveMentees();
  }

  private scrollToTop() {
    setTimeout(() => {
      const nativeElement = document.getElementById('menteesTab');
      if (nativeElement) {
        nativeElement.scrollIntoView(true);
        window.scroll(0, window.scrollY - 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }
}
