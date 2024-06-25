import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  EventEmitter,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  asNativeElements,
} from '@angular/core';
import { ProjectApplication, ProjectService } from '@app/services/project.service';
import { TaskService } from '@app/services/task.service';
import { to } from 'await-to-js';
import { factoryLog } from '@app/services/debug.service';
import { ProgramTerm, ProjectMemberStatus } from '@app/models/project.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DownloadService } from '@app/services/download.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import moment from 'moment';

const log = factoryLog('MenteesTabRowComponent');

const MENTEE_STATUS = {
  ACCEPTED: 'accepted',
  PENDING: 'pending',
};

@Component({
  selector: 'app-mentees-tab-row',
  templateUrl: './mentees-tab-row.component.html',
  styleUrls: ['./mentees-tab-row.component.scss'],
})
export class MenteesTabRowComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() application: ProjectApplication = null as any;
  @Input() taskCompletedList: string[] = [];
  @Input() isAdmin = false;
  @Input() isViewOnly = false;
  @Input() reloadTasksForAssignee = { assigneeId: '' };
  @Input() programTerms: ProgramTerm[] = [];
  @Output() updated = new EventEmitter();
  @ViewChild('statusPlaceholder') statusElem?: ElementRef;
  confirmTpl!: NgbModalRef;
  errorTpl!: NgbModalRef;

  unsubscribe$ = new Subject<void>();
  showTasks = false;
  isTasksLoading = false;
  isStatusLoading = false;
  tasks: any[] = [];
  currentSubmittedStatus = '';

  filters = [
    {
      label: 'Term',
      field: 'term',
      options: this.programTerms,
      value: '',
    },
  ];
  DEFAULT_FILTER_TITLE = 'Select Term';
  filterTitle: string = this.DEFAULT_FILTER_TITLE;
  selectedTerm!: ProgramTerm;
  optionsVisible = false;
  startMonth = '';
  startYear = '';
  endMonth = '';
  endYear = '';
  attendanceStatus = new FormControl('', Validators.required);
  programTerm = new FormControl('', Validators.required);
  mentorshipProgramInfoError = false;
  newMenteeStatus = '';
  errorMessage = '';

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(
    private taskService: TaskService,
    private modalService: NgbModal,
    private projectService: ProjectService,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    //this.setSubmissionStatus();
    this.taskService.submittedStatuses$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.observeSubmittedStatus);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.confirmTpl) {
      this.confirmTpl.close();
    }
  }

  ngAfterViewInit() {
    // if (this.statusElem && this.statusElem.nativeElement) {
    //   const span = this.statusElem.nativeElement as HTMLSpanElement;
    //   this.taskService.statusControls.push(span);
    // }
  }

  ngOnChanges() {
    // Fixes date issue on firefox.
    if (this.application) {
      this.application.ApplicationDateCreate = new Date(
        this.application.ApplicationDateCreate.replace(/-/g, '/') || ''
      ).toString();
      this.application.ApplicationDateUpdated = new Date(
        this.application.ApplicationDateUpdated.replace(/-/g, '/') || ''
      ).toString();
    }

    if (!this.application.MenteeAvatar) {
      this.application.MenteeAvatar = this.downloadService._defaultLogo({
        first: this.application.MenteeName,
        last: '',
      });
    }

    /* Reload the tasks section if no assignee Id is present which means the task is added for all the accepted mentees.
    If the assignee Id is present then reload only for that assignee. Both cases are valid only if the tasks section is open. */
    if (
      !this.reloadTasksForAssignee.assigneeId ||
      (this.reloadTasksForAssignee && this.reloadTasksForAssignee.assigneeId === this.application.MenteeID)
    ) {
      if (this.showTasks) {
        this.tasks = [];
        this.getApplicationTasks();
      }
    }

    const term = this.filters.find(x => x.field === 'term');
    if (term) {
      term.options = this.programTerms;
    }
  }

  toggleTasksList() {
    this.showTasks = !this.showTasks;
    if (this.showTasks) {
      this.tasks = [];
      this.getApplicationTasks();
    }
  }

  setSubmissionStatus() {
    this.currentSubmittedStatus = '';
    if (this.taskCompletedList.length > 0 && this.taskCompletedList.some(id => id === this.application.MenteeID)) {
      this.currentSubmittedStatus = 'Tasks Submitted';
      if (this.statusElem) {
        let span = this.statusElem.nativeElement as HTMLSpanElement;
        span.innerText = 'Tasks Submitted';
      }
      return;
    } else if (this.application.TasksSubmitted) {
      if (this.statusElem) {
        this.currentSubmittedStatus = 'Tasks Submitted';
        let span = this.statusElem.nativeElement as HTMLSpanElement;
        span.innerText = 'Tasks Submitted';
      }
      return;
    }
  }

  observeSubmittedStatus(object: any) {
    log('observeSubmittedStatus result', { object });
    if (object) {
      const { assignees, controls } = object;
      const spanControls = controls as HTMLSpanElement[];
      const applicants = assignees as string[];
      spanControls.forEach(span => {
        const { id, innerText } = span;
        if (innerText !== '' && !applicants.some(x => x === id)) {
          span.innerText = '';
        }
      });
    }
  }

  onSubmittionStatusUpdated(event: any) {
    let results = event as string[];
    this.taskCompletedList = results;
    this.setSubmissionStatus();
  }

  async getApplicationTasks() {
    this.isTasksLoading = true;

    const [err, result] = await to(
      this.taskService.getMenteeCurrentTasks(this.application.MenteeID, this.application.ProjectID).toPromise()
    );

    if (err) {
      log('err', { err });
      this.isTasksLoading = false;

      return;
    }

    if (!result) {
      this.isTasksLoading = false;

      return;
    }

    this.tasks = result.tasks;
    this.isTasksLoading = false;

    return true;
  }

  openConfirm(confirmTemplate: any, additionalClass: string = '') {
    return new Promise((resolve, reject) => {
      this.filterTitle = this.DEFAULT_FILTER_TITLE;
      this.mentorshipProgramInfoError = false;
      this.attendanceStatus.setValue('');
      this.programTerm.setValue('');
      this.startMonth = '';
      this.startYear = '';
      this.endMonth = '';
      this.endYear = '';

      const modal = this.modalService.open(confirmTemplate, {
        centered: true,
        windowClass: 'no-border' + ' ' + additionalClass,
        backdrop: 'static',
      });

      this.confirmTpl = modal;
      this.errorTpl = modal;
      modal.result.then(
        result => {
          log('openConfirm result', { result });
          resolve(result);
        },
        err => reject(err)
      );
    });
  }

  async onStatusChange(
    application: any,
    newStatus: ProjectMemberStatus,
    confirmTemplate: any,
    confirmStatusTemplate: any,
    errorTpl: any
  ) {
    log('entered onStatusChange', { application, newStatus });

    let err: any;
    let result;

    if (application.ApplicationStatus === newStatus) {
      return;
    }

    // if (!confirm(`You are about to change mentee status from ${this.application.ApplicationStatus} to ${newStatus}, are you sure you want to proceed?`)) {
    //   return;
    // }
    this.newMenteeStatus = newStatus;
    [err, result] = await to(this.openConfirm(confirmStatusTemplate, 'status-change-modal'));
    if (err) {
      return;
    }

    if (result !== 'CONFIRM') {
      log('No confirmed');
      return;
    }

    if (newStatus === MENTEE_STATUS.ACCEPTED) {
      [err, result] = await to(this.openConfirm(confirmTemplate, 'modal-window'));
      if (err) {
        return;
      }

      if (result !== 'CONFIRM') {
        log('No confirmed');
        return;
      }
    }

    log('Updating Status');
    this.showTasks = false;
    this.isTasksLoading = false;
    this.isStatusLoading = true;

    [err, result] = await to(
      this.projectService
        .updateProjectMemberStatus(
          this.application.ProjectID,
          this.application.MenteeID,
          newStatus,
          newStatus === MENTEE_STATUS.ACCEPTED ? this.programTerm.value : this.application.ProgramTermID,
          newStatus === MENTEE_STATUS.ACCEPTED ? this.attendanceStatus.value : ''
        )
        .toPromise()
    );

    if (err) {
      // If mentee is already accepted in other mentorship.
      if (err.status === 409) {
        this.errorMessage = err.error;
        await to(this.openConfirm(errorTpl, 'status-change-modal'));
        this.errorTpl.close();
      }

      // @todo: display Error on update
      this.isStatusLoading = false;
      return;
    }

    this.application.ApplicationStatus = newStatus;
    this.application.ApplicationDateUpdated = moment().format('YYYY-MM-DD hh:mm:ss +0000');
    this.isStatusLoading = false;
    this.updated.emit();
    return;
  }

  applyFilter(filter: any, option: ProgramTerm) {
    this.filterTitle = option.name === '' ? this.DEFAULT_FILTER_TITLE : option.name;
    this.selectedTerm = option;
    this.optionsVisible = false;

    this.startMonth = this.months[new Date(+option.startDateTime * 1000).getUTCMonth()];
    this.startYear = new Date(option.startDateTime * 1000).getUTCFullYear().toString();
    this.endMonth = this.months[new Date(+option.endDateTime * 1000).getUTCMonth()];
    this.endYear = new Date(option.endDateTime * 1000).getUTCFullYear().toString();

    this.programTerm.setValue(option.id);
  }

  toggle(dropdownTerms: any) {
    if (!dropdownTerms.isOpen()) {
      dropdownTerms.open();
    } else {
      dropdownTerms.close();
    }
    this.optionsVisible = !this.optionsVisible;
  }

  onMentorshipProgramInfoSubmit() {
    if (this.attendanceStatus.value === '' || this.programTerm.value === '') {
      this.mentorshipProgramInfoError = true;
      return;
    }

    this.confirmTpl.close('CONFIRM');
  }

  onConfirmStatusChnage() {
    this.confirmTpl.close('CONFIRM');
  }
}
