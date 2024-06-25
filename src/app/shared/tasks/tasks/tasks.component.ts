// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { SUBMIT_CLOSE_DELAY_MS } from '@app/core';
import { Profile, Relationship } from '@app/models/user.model';
import { AuthService } from '@app/services/auth.service';
import { MenteeService } from '@app/services/mentee.service';
import { MentorService } from '@app/services/mentor.service';
import { ProjectService } from '@app/services/project.service';
import { TaskService } from '@app/services/task.service';
import { UserService } from '@app/services/user.service';
import { SubmitState } from '@app/shared/submit-button/submit-button.component';
import { NgbActiveModal, NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskFilter, TaskFilterComponent, TaskFilterToggleEvent } from '../task-filter/task-filter.component';
import {
  // ProgramTerms,
  ProgramTerm,
  Project,
  ProjectResponse,
  Task,
} from '@app/models/project.model';
import { Component, HostListener, Input, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { BehaviorSubject, forkJoin, Subject, Subscription, Observable, of, combineLatest, throwError } from 'rxjs';
import { map, concatMap, takeUntil, tap, filter, take, delay, catchError, skip } from 'rxjs/operators';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators, ValidationErrors } from '@angular/forms';
import { FileUploadService } from '@app/core/file-upload.service';
import { factoryLog } from '@app/services/debug.service';
import { TasksHelperService } from './tasks-helpers.service';
import { DownloadService } from '@app/services/download.service';

const log = factoryLog('TasksComponent');
const APPRENTICE_FILTERS: TaskFilter[] = [
  {
    label: 'Task Status',
    options: ['All', 'Pending', 'In Progress', 'Submitted', 'Completed'],
    type: 'task',
  },
  {
    exclusive: true,
    label: 'Sorting Order',
    options: ['Ascending', 'Descending'],
    type: 'project',
    defaultOpt: 'Ascending',
  },
];

const ADMIN_FILTERS: TaskFilter[] = [...APPRENTICE_FILTERS];
const GROUPBY_FILTER: TaskFilter = {
  exclusive: true,
  label: 'Group By',
  options: ['Project', 'Mentee'],
  type: 'project',
  defaultOpt: 'Project',
};
const MAINTAINER_PROJECT_LIMIT = undefined;
const MENTEE_PROJECT_LIMIT = undefined;
const MENTOR_PROJECT_LIMIT = undefined;
const EMPTY_TASK_PROJECT = 'none';
const EMPTY_TASK_MENTEE = 'none';
const ALL_TASK_MENTEE = 'allTaskMentee';

export interface ApprenticeProjectTasksSection {
  apprenticeProjects: ProjectWithTasks[];
  apprenticeId?: string;
  apprenticeEmail?: string;
  apprenticeName?: string;
  apprenticeAvatarUrl?: string;
  apprenticeLoggedIn?: boolean;
  apprenticeStatus?: string;
}

interface ApprenticeTasksSection {
  allTasks: TaskView[];
  apprenticeColor: string;
  apprenticeEmail: string;
  apprenticeId: string;
  apprenticeName: string;
  apprenticeAvatarUrl?: string;
  apprenticeStatus?: string;
}

interface ProjectTasksSection {
  allTasks: TaskView[];
  projectId: string;
  projectColor: string;
  projectName: string;
  projectLogoUrl?: string;
  createdOn?: string;
}

interface ProjectWithTasks {
  projectColor: string;
  projectId: string;
  projectName: string;
  projectTerms: ProgramTerm[];
  projectTasks: TaskView[];
  projectLogoUrl?: string;
  projectMenteeStatus?: string;
  createdOn?: string;
  apprenticeName?: string;
  menteeStatus?: string;
}

export interface TaskView {
  taskStatus: string;
  taskId?: string;
  taskName?: string;
  taskIcon?: string;
  taskDescription?: string;
  taskDueDate?: string;
  taskCreatedOn?: string;
  taskUpdatedOn?: string;
  taskCategory?: string;

  projectName?: string;
  file?: string;
  apprenticeName?: string;
  custom?: string;
  // @info: If mentee is graduated, we will force display complete in its tasks
  // that allow to rollback the mentee status safely without effort
  menteeGraduated?: boolean;
  submitFile?: string;
}

interface TaskViewGroup {
  color: string;
  name: string;
  icon?: string;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [NgbActiveModal],
})
export class TasksComponent implements OnInit, OnDestroy {
  disableAction = false;
  @Input() menteeId?: string;

  readonly apprenticeFilters: TaskFilter[] = [...APPRENTICE_FILTERS];
  readonly adminFilters: TaskFilter[] = [...ADMIN_FILTERS];
  readonly currentDate = new Date(Date.now());
  // readonly emptyTaskMentee = EMPTY_TASK_MENTEE;
  readonly allTaskMentee = ALL_TASK_MENTEE;
  readonly emptyTaskProject = EMPTY_TASK_PROJECT;
  readonly submitState = SubmitState;
  readonly apprentices$ = new BehaviorSubject<ApprenticeProjectTasksSection[]>([]);
  readonly assignees$ = new BehaviorSubject<ApprenticeProjectTasksSection[]>([]);
  readonly groupBy$ = new BehaviorSubject<'Project' | 'Mentee' | undefined>(undefined);

  readonly sortBy$ = new BehaviorSubject<any>(undefined);
  readonly loggedInApprenticeProjects$ = new BehaviorSubject<ProjectWithTasks[]>([]);
  readonly nextPageKeyApprentice$ = new BehaviorSubject('');
  readonly nextPageKeyMaintainer$ = new BehaviorSubject('');
  readonly nextPageKeyMentor$ = new BehaviorSubject('');
  readonly nextPageKeyMaintainerTasks$ = new BehaviorSubject('');
  readonly nextPageKeyMentorTasks$ = new BehaviorSubject('');
  readonly submitState$ = new BehaviorSubject<SubmitState>(SubmitState.READY);
  readonly progressState$ = new BehaviorSubject<SubmitState>(SubmitState.READY);

  private addButton: HTMLButtonElement | null = null;
  sortOrder: string[];
  canShowApprentice = false;
  canShowAssignees = false;
  isApprentice = false;
  isMaintainerAdmin = false;
  isMentor = false;
  numAdminFiltersActive = 0;
  numFiltersActive = 0;
  taskIdBeingEdited = '';
  taskIsBeingAdded = false;
  taskIsBeingEdited = false;
  taskStatusIsBeingEdited = false;
  taskSubmitted = false;
  form: FormGroup;
  taskDescription: AbstractControl;
  taskDueDate: AbstractControl;
  taskName: AbstractControl;
  taskProject: AbstractControl;
  taskMentee: AbstractControl;
  submitFile: FormControl;
  taskFile: AbstractControl;
  taskFileData?: File;
  totAdminFilters!: number;
  totFilters!: number;
  assigneeGroups$!: Observable<ApprenticeTasksSection[]>;
  projects$!: Observable<ProjectTasksSection[]>;
  shouldShowNextButtonApprentice$!: Observable<boolean>;
  shouldShowNextButtonMaintainer$!: Observable<boolean>;
  shouldShowNextButtonMentor$!: Observable<boolean>;
  activeModal?: NgbActiveModal;
  isPageLoading = false;
  showJumpToTopIcon = false;

  private readonly filterFunction$ = new BehaviorSubject<(project: ProjectWithTasks) => boolean>(() => true);
  private readonly filterFunctionAdmin$ = new BehaviorSubject<(project: ProjectWithTasks) => boolean>(() => true);
  private readonly filterFunctionAdminTasks$ = new BehaviorSubject<(task: TaskView) => boolean>(() => true);
  private readonly filterFunctionTasks$ = new BehaviorSubject<(task: TaskView) => boolean>(() => true);
  private readonly unsubscribe$ = new Subject<void>();

  private currentAssigneeId = '';
  private currentProjectId = '';
  private taskStatus: AbstractControl;
  private currentTask?: TaskView;

  get isAdmin(): boolean {
    return this.isMentor || this.isMaintainerAdmin;
  }

  @ViewChildren(TaskFilterComponent) filterViews!: TaskFilterComponent[];
  menteeRelashionship: Relationship[] = [];
  constructor(
    private authService: AuthService,
    private menteeService: MenteeService,
    private mentorService: MentorService,
    private modalService: NgbModal,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private tasksHelperService: TasksHelperService,
    private downloadService: DownloadService
  ) {
    this.form = new FormGroup({
      taskName: new FormControl('', Validators.required),
      taskDueDate: new FormControl('', this.dueDateValidator()),
      taskDescription: new FormControl('', Validators.required),
      submitFile: new FormControl(''),
      taskFile: new FormControl(''),
      taskMentee: new FormControl(ALL_TASK_MENTEE, this.validateTaskMentee()),
      taskProject: new FormControl(EMPTY_TASK_PROJECT, this.validateTaskProject()),
      taskStatus: new FormControl(''),
    });

    this.taskName = this.form.controls['taskName'];
    this.taskDueDate = this.form.controls['taskDueDate'];
    this.taskDescription = this.form.controls['taskDescription'];
    this.taskStatus = this.form.controls['taskStatus'];
    this.taskMentee = this.form.controls['taskMentee'];
    this.taskProject = this.form.controls['taskProject'];

    this.sortOrder = ['Ascending'];
    this.taskFile = this.form.controls['taskFile'];
    this.submitFile = this.form.get('submitFile') as FormControl;
  }

  ngOnInit() {
    this.isPageLoading = true;
    this.apprentices$.pipe(skip(1)).subscribe(
      () => {
        this.isPageLoading = false;
      },
      () => {
        this.isPageLoading = false;
      }
    );

    this.authService.isAuthenticated$
      .pipe(
        filter(loggedIn => loggedIn === true),
        take(1),
        concatMap(
          (): Observable<[boolean, boolean, boolean]> => {
            if (this.menteeId) {
              return this.userService.getUserRelationships(this.menteeId, true).pipe(
                tap(relationships => {
                  this.menteeRelashionship = relationships;
                }),
                map(relationships => relationships.map(({ myRole }) => myRole)),
                map(relationships =>
                  relationships.reduce(
                    ([isApprentice, isMaintainerAdmin, isMentor], myRole): [boolean, boolean, boolean] => {
                      if (myRole === 'mentor') {
                        return [isApprentice, isMaintainerAdmin, true];
                      }

                      if (myRole === 'maintainer') {
                        return [isApprentice, true, isMentor];
                      }

                      return [isApprentice, isMaintainerAdmin, isMentor];
                    },
                    [localStorage.getItem('userId') === this.menteeId, false, false] as [boolean, boolean, boolean]
                  )
                )
              );
            }

            return of([true, false, false] as [boolean, boolean, boolean]);
            // return this.getTasksForMaintainerUser().pipe(
            //   map(
            //     maintainerAssignees =>
            //       [
            //         localStorage.getItem('isApprentice') === 'true',
            //         maintainerAssignees.length > 0,
            //         localStorage.getItem('isMentor') === 'true',
            //       ] as [boolean, boolean, boolean]
            //   )
            // );
          }
        ),
        tap(([isApprentice, isMaintainerAdmin, isMentor]) => {
          this.isApprentice = isApprentice;
          this.isMaintainerAdmin = isMaintainerAdmin;
          this.isMentor = isMentor;
        }),
        filter(() => {
          const validMode = this.hasValidMode();
          if (!validMode) {
            this.isPageLoading = false;
          }
          return validMode;
        }),
        map(() => localStorage.getItem('userId')),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        userId => {
          if (!userId) {
            this.isPageLoading = false;
            return;
          }

          if (this.isAdmin) {
            if (this.menteeId) {
              this.groupBy$.next('Mentee');
              this.taskProject.updateValueAndValidity();
              this.taskMentee.updateValueAndValidity();
            } else {
              this.groupBy$.next('Project');
              this.taskProject.updateValueAndValidity();
              this.taskMentee.updateValueAndValidity();
              this.adminFilters.push(GROUPBY_FILTER);
            }
          }

          const filterTotals = [this.adminFilters, this.apprenticeFilters].map(filters =>
            filters
              .filter(({ exclusive }) => !exclusive)
              .reduce((total, { options: { length: numOptions } }) => total + numOptions, 0)
          );

          [this.totAdminFilters, this.totFilters] = filterTotals;
          [this.numAdminFiltersActive, this.numFiltersActive] = filterTotals;

          this.shouldShowNextButtonApprentice$ = this.nextPageKeyApprentice$.pipe(map(Boolean));
          this.shouldShowNextButtonMaintainer$ = this.nextPageKeyMaintainer$.pipe(map(Boolean));
          this.shouldShowNextButtonMentor$ = this.nextPageKeyMentor$.pipe(map(Boolean));

          this.getTasksForUser({ authorizeUser: true });

          this.apprentices$
            .pipe(
              map(() => this.activeModal),
              filter((activeModal): activeModal is NgbActiveModal => !!activeModal),
              takeUntil(this.unsubscribe$)
            )
            .subscribe(activeModal => activeModal.close());

          const loggedInApprentice$ = this.apprentices$.pipe(
            map(apprentices => apprentices.filter(({ apprenticeLoggedIn }) => apprenticeLoggedIn))
          );
          const assignees$ = this.apprentices$.pipe(
            map(apprentices => apprentices.filter(({ apprenticeLoggedIn }) => !apprenticeLoggedIn))
          );

          this.setupFilters(loggedInApprentice$, this.filterFunction$, this.filterFunctionTasks$, this.sortBy$)
            .pipe(
              map(apprentices => (apprentices.length ? [...apprentices[0].apprenticeProjects] : [])),
              map(projects => projects.sort(this.sortProjects('projectName'))),
              takeUntil(this.unsubscribe$)
            )
            .subscribe(this.loggedInApprenticeProjects$);

          this.setupFilters(assignees$, this.filterFunctionAdmin$, this.filterFunctionAdminTasks$, this.sortBy$)
            .pipe(
              map(assignees =>
                [...assignees].sort(this.sortApprentices('apprenticeName')).map(assignee => ({
                  ...assignee,
                  apprenticeProjects: [...assignee.apprenticeProjects].sort(this.sortProjects('projectName')),
                }))
              ),
              takeUntil(this.unsubscribe$)
            )
            .subscribe(this.assignees$);

          this.assigneeGroups$ = this.assignees$.pipe(
            map(apprentices =>
              apprentices.map(item => {
                const { apprenticeAvatarUrl, apprenticeEmail, apprenticeId, apprenticeName, apprenticeProjects } = item;

                return {
                  ...item,
                  allTasks: this.getAllApprenticeTasks(this.getUniqueProjects(apprenticeProjects)),
                  apprenticeAvatarUrl: apprenticeAvatarUrl
                    ? apprenticeAvatarUrl
                    : this.downloadService._defaultLogo({ first: apprenticeName, last: '' }),
                  apprenticeEmail: apprenticeEmail as string,
                  apprenticeId: apprenticeId as string,
                  apprenticeColor: '#CCCCCC',
                  apprenticeName: apprenticeName as string,
                };
              })
            )
          );

          this.assigneeGroups$ = this.assigneeGroups$.pipe(
            map(apprentices => apprentices.sort(this.sortMentees('apprenticeName')))
          );

          this.projects$ = this.assignees$.pipe(
            map(apprentices => this.apprenticesToProjects(apprentices).sort(this.sortProjects('projectName')))
          );

          this.taskMentee.statusChanges.subscribe(
            () => (this.currentAssigneeId = this.taskMentee.valid ? this.taskMentee.value : '')
          );
          this.taskProject.statusChanges.subscribe(
            () => (this.currentProjectId = this.taskProject.valid ? this.taskProject.value : '')
          );
        },
        () => {
          this.isPageLoading = false;
        }
      );

    this.currentDate.setDate(this.currentDate.getDate() + 1);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  @HostListener('window:scroll') // for window scroll events
  onScroll() {
    this.showJumpToTopIcon = window.scrollY > 180;
  }

  onEditTask(edit: any, task: TaskView) {
    log('entered onEditTask', { task });
    this.taskName.setValue(task.taskName);
    this.taskDueDate.reset();

    const { taskDueDate } = task;

    if (taskDueDate) {
      this.taskDueDate.setValue({
        year: this.ngbDateParserFormatter.parse(taskDueDate).year,
        month: this.ngbDateParserFormatter.parse(taskDueDate).month,
        day: this.ngbDateParserFormatter.parse(taskDueDate).day,
      });
    }

    this.taskDescription.setValue(task.taskDescription);
    this.taskStatus.setValue(task.taskStatus);

    const submitFileValue = this.tasksHelperService.tasksHasSubmitFileRequired(task);
    this.submitFile.setValue(submitFileValue);

    const selectMenus = [
      [this.taskProject, EMPTY_TASK_PROJECT],
      [this.taskMentee, EMPTY_TASK_MENTEE],
    ] as [AbstractControl, string][];

    selectMenus.forEach(([control, emptyValue]) => {
      control.reset();
      control.patchValue(emptyValue);
      control.markAsUntouched();
      control.markAsPristine();
      control.updateValueAndValidity();
    });

    this.currentTask = task;
    this.activeModal = this.modalService.open(edit, { ariaLabelledBy: 'Edit Task', windowClass: 'task-modal' });
  }

  onNewTask(create: any, { projectId, apprenticeId }: { projectId?: string; apprenticeId?: string } = {}) {
    log('entered onNewTask');
    const { value: groupBy } = this.groupBy$;

    this.taskSubmitted = false;

    this.taskFileData = undefined;
    Object.values(this.form.controls).forEach(control => control.reset());

    if (!projectId || !apprenticeId) {
      const selectMenus = [
        [this.taskProject, EMPTY_TASK_PROJECT],
        [this.taskMentee, EMPTY_TASK_MENTEE],
      ] as [AbstractControl, string][];

      selectMenus.forEach(([control, emptyValue]) => {
        control.patchValue(emptyValue);
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      });
    }

    if (projectId) {
      this.currentProjectId = projectId;
    }

    if (apprenticeId) {
      this.currentAssigneeId = apprenticeId;
    }

    if (groupBy) {
      let items: string[] | undefined;
      let control: AbstractControl | undefined;

      if (groupBy === 'Mentee') {
        items = this.getRelevantProjects().map(({ projectId }) => projectId);
        control = this.taskProject;
      } else {
        items = this.getRelevantAssignees().map(({ apprenticeId }) => apprenticeId as string);
        control = this.taskMentee;
      }

      if (items && items.length === 1) {
        control.patchValue(items[0]);

        if (control.enabled) {
          control.disable();
        }

        if (groupBy === 'Mentee') {
          this.currentProjectId = control.value;
        } else {
          control.enable();
          control.patchValue(ALL_TASK_MENTEE);
          this.currentAssigneeId = control.value;
        }
      } else if (control.disabled) {
        control.enable();
      }
    }

    this.activeModal = this.modalService.open(create, { ariaLabelledBy: 'Create Task', windowClass: 'task-modal' });
  }

  onSubmitEditTask(): Subscription | undefined {
    log('entered onSubmitEditTask');
    if (
      this.form.valid &&
      this.currentTask &&
      this.currentTask.taskId &&
      this.submitState$.value === SubmitState.READY
    ) {
      const task: Task = {
        id: this.currentTask.taskId,
        name: this.taskName.value,
        description: this.taskDescription.value,
        dueDate: this.ngbDateParserFormatter.format(this.taskDueDate.value),
        status: this.taskStatus.value,
        submitFile: this.tasksHelperService.getSubmitFileValueFromCheckbox(this.submitFile.value),
      };

      this.taskSubmitted = false;
      this.submitState$.next(SubmitState.SUBMITTING);
      log('editing task', { task });
      return this.taskService
        .updateTask(this.currentTask.taskId, task)
        .pipe(
          tap(() => this.submitState$.next(SubmitState.SUCCESS)),
          delay(SUBMIT_CLOSE_DELAY_MS),
          map(() => {
            this.taskIsBeingEdited = true;

            if (this.currentTask && this.currentTask.taskId) {
              this.taskStatusIsBeingEdited = task.status !== this.currentTask.taskStatus;
              this.taskIdBeingEdited = this.currentTask.taskId;
            }

            return this.activeModal as NgbActiveModal;
          }),
          catchError(error => {
            this.submitState$.next(SubmitState.READY);
            return throwError(error);
          })
        )
        .subscribe(activeModal => {
          if (activeModal) {
            activeModal.close();
          }
          this.activeModal = undefined;
          this.submitState$.next(SubmitState.DISABLED);
          this.getTasksForUser({ refreshTasks: true });
        });
    }

    this.taskSubmitted = true;
  }

  onSubmitNewTask(): Subscription | undefined {
    log('entered onSubmitNewTask');
    const taskProjectId = this.currentProjectId;
    const taskApprenticeId = this.currentAssigneeId;

    if (this.form.valid && taskProjectId && taskApprenticeId) {
      const task: Task = {
        name: this.taskName.value,
        description: this.taskDescription.value,
        dueDate: this.ngbDateParserFormatter.format(this.taskDueDate.value),
        status: 'pending',
        projectId: taskProjectId,
        ownerId: localStorage.getItem('userId') || '',
        assigneeId: taskApprenticeId === ALL_TASK_MENTEE ? '' : taskApprenticeId.split('|')[0],
        category: 'nonPrerequisite',
        submitFile: this.tasksHelperService.getSubmitFileValueFromCheckbox(this.submitFile.value),
      };
      if (this.taskFileData) {
        return this.fileUploadService.uploadFile(this.taskFileData).subscribe(taskFile => {
          task.file = taskFile;
          return this.submitTask(task);
        });
      } else {
        log('data to submit', { task });
        return this.submitTask(task);
      }
    }
    log('Task not submitted');
    this.taskSubmitted = true;
  }

  setTargetBtn(button: HTMLButtonElement) {
    this.addButton = button;
    if (this.form.valid) {
      button.disabled = true;
      button.innerHTML = `<span _ngContent-c12><i class="fa fa-spinner fa-spin"></i> &nbsp;Submitting</span>`;
    }
  }

  setBtnState(str: string) {
    if (this.addButton !== null) {
      if (str !== 'Task Added') {
        this.addButton.innerHTML = `<span _ngContent-c12><i class="fa fa-spinner fa-spin"></i> &nbsp;${str}</span>`;
      } else {
        this.addButton.innerHTML = `<span _ngContent-c12><i class="fa fa-check-circle"></i> &nbsp;${str}</span>`;
        this.submitState$.next(SubmitState.SUCCESS);
        this.addButton.disabled = false;
      }
    }
  }

  submitTask(task: Task) {
    log('entered submitTask');
    this.taskSubmitted = false;
    this.taskIsBeingAdded = true;
    this.setBtnState('Adding Task...');
    task.custom = 'undefined';
    return this.taskService
      .createTask(task)
      .pipe(
        tap(() => {
          this.setBtnState('Task Added');
        }),
        delay(SUBMIT_CLOSE_DELAY_MS),
        map(() => {
          return this.activeModal as NgbActiveModal;
        }),
        catchError(error => {
          this.setBtnState('Add Task');
          return throwError(error);
        })
      )
      .subscribe(activeModal => {
        if (activeModal) {
          activeModal.close();
        }
        this.activeModal = undefined;
        this.setBtnState('Fetching tasks...');
        this.getTasksForUser({ refreshTasks: true });
      });
  }

  onToggleFilter(targetFilter: TaskFilter) {
    this.filterViews.filter(filter => filter.filter !== targetFilter).forEach(filter => filter.close());
  }

  onUpdateFilter({ delta, label, options }: TaskFilterToggleEvent, { isAdmin = false, isProjectFilter = false }) {
    let filterFunction: ((value: any) => boolean) | undefined = undefined;

    switch (label) {
      // case 'Term':
      //   filterFunction = this.filterByTerms(options);
      //   break;
      case 'Task Status':
        filterFunction = this.filterByStatus(options);
        break;
      case 'Sorting Order':
        this.sortOrder = options;
        this.sortBy$.next(this.sortOrder);
        break;
      case 'Group By':
        this.groupBy$.next(options.length > 0 ? (options[0] as 'Project' | 'Mentee') : undefined);
        break;
    }

    this.taskProject.updateValueAndValidity();
    this.taskMentee.updateValueAndValidity();

    if (filterFunction) {
      let filter$: Subject<(value: any) => boolean>;

      if (isAdmin) {
        filter$ = isProjectFilter ? this.filterFunctionAdmin$ : this.filterFunctionAdminTasks$;
        this.numAdminFiltersActive += delta;
      } else {
        filter$ = isProjectFilter ? this.filterFunction$ : this.filterFunctionTasks$;
        this.numFiltersActive += delta;
      }

      filter$.next(filterFunction);
    }
  }

  onUpdateStatus(id: string, status: string) {
    if (this.disableAction) {
      return;
    }
    this.disableAction = true;
    this.taskStatusIsBeingEdited = true;
    this.taskIdBeingEdited = id;
    this.taskService.updateTaskStatus(id, status).subscribe(
      task => {
        this.getTasksForUser({ refreshTasks: true }, this.disableAction);
        // this.disableAction = false;
      },
      () => {
        this.disableAction = false;
        this.taskStatusIsBeingEdited = false;
        this.taskIdBeingEdited = '';
      }
    );
  }

  getBadgeType(status: string): string | undefined {
    switch (status) {
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  }

  getGroupedTasks(): TaskViewGroup[] {
    return [];
  }

  getTaskIcon(apprentice: ApprenticeProjectTasksSection, project: ProjectWithTasks): string | undefined {
    switch (this.groupBy$.value) {
      case 'Mentee':
        return project.projectLogoUrl;
      case 'Project':
        return apprentice.apprenticeAvatarUrl;
    }
  }

  hasAdminTasks(): boolean {
    return this.assignees$.value.some(
      ({ apprenticeProjects }) =>
        apprenticeProjects.length > 0 && apprenticeProjects.some(({ projectTasks }) => projectTasks.length > 0)
    );
  }

  hasAssignedTasks(): boolean {
    const { value: assignedTasks } = this.loggedInApprenticeProjects$;
    return assignedTasks.length > 0 && assignedTasks.some(({ projectTasks }) => projectTasks.length > 0);
  }

  trackProjects(project: ProjectWithTasks | ProjectTasksSection): string {
    return project.projectId;
  }

  trackApprentices(apprentice: ApprenticeProjectTasksSection | ApprenticeTasksSection): string {
    return apprentice.apprenticeId as string;
  }

  trackFilters({ label }: { label: string }): string {
    return label;
  }

  getRelevantAssignees(): ApprenticeProjectTasksSection[] {
    return this.assignees$.value.filter(({ apprenticeProjects }) =>
      apprenticeProjects.map(({ projectId }) => projectId).includes(this.currentProjectId)
    );
  }

  getActiveAssignees(projectID: string = ''): ApprenticeProjectTasksSection[] {
    var requestedProjectID = this.currentProjectId;
    if (!!projectID) {
      requestedProjectID = projectID;
    }

    return this.assignees$.value
      .filter(({ apprenticeProjects }) =>
        apprenticeProjects.map(({ projectId }) => projectId).includes(requestedProjectID)
      )
      .filter(function(apprentice) {
        return ['accepted'].includes(apprentice.apprenticeStatus || '');
      });
  }

  getRelevantProjects(): ProjectWithTasks[] {
    const projects = this.assignees$.value
      .filter(({ apprenticeId }) => apprenticeId === this.currentAssigneeId)
      .reduce((all, { apprenticeProjects }) => [...all, ...apprenticeProjects], [] as ProjectWithTasks[])
      .sort(this.sortProjects('projectName'));
    return this.getUniqueProjects(projects);
  }

  onCancel() {
    if (this.activeModal && confirm('You will lose your changes - are you sure you wish to cancel?')) {
      this.activeModal.close();
    }
  }

  // Custom form validators
  private dueDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      if (typeof control.value !== 'object') {
        return { invalidDueDateTemplate: { value: control.value } };
      }

      const actualDueDate = new Date(this.ngbDateParserFormatter.format(control.value));
      if (actualDueDate < this.currentDate && actualDueDate.toDateString() !== this.currentDate.toDateString()) {
        return { invalidDueDate: { value: control.value } };
      }

      return null;
    };
  }

  private filterByStatus(statuses: string[]): (task: TaskView) => boolean {
    const statusKeys = statuses.map(status =>
      status
        .toLocaleLowerCase()
        .split(' ')
        .join('')
    );
    return ({ taskStatus }: TaskView) => {
      return (
        !taskStatus ||
        statusKeys.includes('all') ||
        statusKeys.includes(
          taskStatus
            .toLocaleLowerCase()
            .split(' ')
            .join('')
        )
      );
    };
  }

  // private filterByTerms(terms: string[]): (project: ProjectWithTasks) => boolean {
  //   return ({ projectTerms }: ProjectWithTasks) => terms.some((term) => (projectTerms as any)[term.toLocaleLowerCase()]);
  // }

  private getTasksForUser(
    { authorizeUser, refreshTasks }: { authorizeUser?: boolean; refreshTasks?: boolean } = {} as any,
    disableAction?: boolean
  ) {
    log('entered getTasksForUser');
    if (refreshTasks) {
      this.isPageLoading = true;
    }

    const userId = localStorage.getItem('userId');

    if (!userId) {
      if (disableAction) {
        this.disableAction = false;
      }
      return;
    }

    const allApprentices = [] as Observable<ApprenticeProjectTasksSection[]>[];
    let assignees$: Observable<ApprenticeProjectTasksSection[]>;

    [
      this.nextPageKeyApprentice$,
      this.nextPageKeyMaintainer$,
      this.nextPageKeyMentor$,
      this.nextPageKeyMaintainerTasks$,
      this.nextPageKeyMentorTasks$,
    ].forEach(nextPage$ => nextPage$.next(''));

    // if (this.isAdmin && (this.canShowAssignees || authorizeUser)) {
    // const sources: any = [];

    // if (this.isMaintainerAdmin) {
    //   sources.push(this.getTasksForMaintainerUser(this.menteeId));
    // }

    // if (this.isMentor) {
    //   sources.push(this.getTasksForMentorUser(userId));
    // }

    // assignees$ = forkJoin(sources).pipe(map(result => result.reduce((all, assignees) => [...all, ...assignees])));

    // if (this.menteeId) {
    //   assignees$ = assignees$.pipe(
    //     map(apprentices =>
    //       apprentices.filter(({ apprenticeId, apprenticeStatus }) => {
    //         apprenticeId = apprenticeId && apprenticeId.slice(0, 36);
    //         const skipStatusList = ['withdrawn', 'declined'];
    //         return apprenticeId === this.menteeId && apprenticeStatus && !skipStatusList.includes(apprenticeStatus);
    //       })
    //     )
    //   );
    // }
    // } else {
    //   assignees$ = of([]);
    // }

    assignees$ = of([]);

    if (authorizeUser) {
      this.canShowApprentice = !this.menteeId;
      assignees$ = assignees$.pipe(tap(() => (this.canShowAssignees = !this.menteeId || this.isAdmin)));
    }

    assignees$ = assignees$.pipe(
      map(assignees =>
        [...assignees]
          .sort(({ apprenticeId: apprenticeId1 }, { apprenticeId: apprenticeId2 }) =>
            (apprenticeId1 as string).localeCompare(apprenticeId2 as string)
          )
          .reduce((filtered, apprentice, i, all) => {
            if (i === 0 || apprentice.apprenticeId !== all[i - 1].apprenticeId) {
              filtered.push(apprentice);
            }

            return filtered;
          }, [] as ApprenticeProjectTasksSection[])
      )
    );

    allApprentices.push(assignees$);

    if (this.isApprentice && this.canShowApprentice) {
      allApprentices.push(this.getTasksForApprenticeUser(userId));
    } else {
      allApprentices.push(of([]));
    }

    forkJoin(allApprentices)
      .pipe(
        map(result => result.reduce((all, apprentices) => [...all, ...apprentices])),
        map(apprentices => (refreshTasks ? apprentices : [...this.apprentices$.value, ...apprentices])),
        map(currentApprenticeList => {
          if (!this.isMentor) {
            return currentApprenticeList;
          }

          let reducedApprenticeList: ApprenticeProjectTasksSection[] = [];
          const skipStatusList = ['withdrawn', 'declined'];
          for (let apprentice of currentApprenticeList) {
            if (
              (apprentice.apprenticeStatus && !skipStatusList.includes(apprentice.apprenticeStatus)) ||
              apprentice.apprenticeLoggedIn
            ) {
              reducedApprenticeList.push(apprentice);
            }
          }
          return reducedApprenticeList;
        }),
        tap(() => {
          this.taskIsBeingAdded = false;
          this.taskIsBeingEdited = false;
          this.taskStatusIsBeingEdited = false;
          this.taskIdBeingEdited = '';

          this.currentAssigneeId = '';
          this.currentProjectId = '';
          this.currentTask = undefined;

          if (authorizeUser) {
            // this.isPageLoading = false;
          } else if (refreshTasks) {
            this.submitState$.next(SubmitState.READY);
          }
        }),
        catchError(error => {
          // this.isPageLoading = false;
          return throwError(error);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        result => {
          this.apprentices$.next(result);
          if (disableAction) {
            this.disableAction = false;
          }
        },
        () => {
          this.isPageLoading = false;
          if (disableAction) {
            this.disableAction = false;
          }
        }
      );
  }

  private getTasksForApprenticeUser(assigneeId: string): Observable<ApprenticeProjectTasksSection[]> {
    return forkJoin(
      this.menteeService.getMenteePrivateProjects(assigneeId),
      this.taskService.getCurrentTasks(assigneeId)
    ).pipe(
      tap(res => this.nextPageKeyApprentice$.next(res[0].nextPageKey)),
      map(res => {
        const tasks = res[1].tasks;
        res[0].projects.map(project => {
          if (tasks) {
            project.tasks = tasks.filter(task => {
              return task.projectId === project.projectId;
            });
          } else {
            project.tasks = [];
          }
          return project;
        });
        return res[0].projects;
      }),
      map(this.projectsToApprenticeProjectTasksSection(true))
    );
  }

  // private getTasksForMaintainerUser(assigneeId?: string): Observable<ApprenticeProjectTasksSection[]> {
  //   log('entered getTasksForMaintainerUser');
  //   if (assigneeId) {
  //     return of(this.menteeRelashionship).pipe(
  //       concatMap(relationship => {
  //         if (relationship && relationship.length > 0) {
  //           return forkJoin(
  //             relationship
  //               .filter(res => {
  //                 return res.theirRole === 'apprentice';
  //               })
  //               .map(({ projectId }) => this.projectService.getProject(projectId))
  //           ).pipe(
  //             map(projects => ({ projects, nextPageKey: '' })),
  //             catchError(error => {
  //               // this.isPageLoading = false;
  //               return throwError(error);
  //             })
  //           );
  //         }

  //         return of({ projects: [], nextPageKey: '' });
  //       }),
  //       concatMap(this.getAssignees(this.nextPageKeyMaintainer$, this.nextPageKeyMaintainerTasks$, assigneeId)),
  //       tap(data => {
  //         if (!data.length) {
  //           // this.isPageLoading = false;
  //         }
  //       })
  //     );
  //   }
  //   return this.projectService.getProjects('maintainer', '99').pipe(
  //     concatMap(({ nextPageKey, projects }) => {
  //       if (projects && projects.length > 0) {
  //         return forkJoin(projects.map(({ projectId }) => this.projectService.getProject(projectId))).pipe(
  //           map(projects => ({ projects, nextPageKey })),
  //           catchError(error => {
  //             // this.isPageLoading = false;
  //             return throwError(error);
  //           })
  //         );
  //       }

  //       return of({ projects: [], nextPageKey });
  //     }),
  //     concatMap(this.getAssignees(this.nextPageKeyMaintainer$, this.nextPageKeyMaintainerTasks$, assigneeId)),
  //     tap(data => {
  //       if (!data.length) {
  //         // this.isPageLoading = false;
  //       }
  //     })
  //   );
  // }

  // private getTasksForMentorUser(userId: string): Observable<ApprenticeProjectTasksSection[]> {
  //   log('entered getTasksForMentorUser');
  //   return this.mentorService
  //     .getMentorProjects(userId, MENTOR_PROJECT_LIMIT ? MENTOR_PROJECT_LIMIT + '' : undefined)
  //     .pipe(
  //       concatMap(this.getAssignees(this.nextPageKeyMentor$, this.nextPageKeyMentorTasks$, this.menteeId)),
  //       tap(data => {
  //         if (!data.length) {
  //           // this.isPageLoading = false;
  //         }
  //       })
  //     );
  // }

  private getAllApprenticeTasks(apprenticeProjects: ProjectWithTasks[]): TaskView[] {
    return [
      ...apprenticeProjects.reduce(
        (all, { projectTasks, projectLogoUrl: taskIcon, projectName: projectName }) => [
          ...all,
          ...projectTasks.map(task => ({ ...task, taskIcon, projectName })),
        ],
        [] as any[]
      ),
    ];
  }

  private getAssignees(
    nextPageKey$: BehaviorSubject<string>,
    nextPageTasksKey$: BehaviorSubject<string>,
    assigneeId?: string
  ): (response: ProjectResponse) => Observable<ApprenticeProjectTasksSection[]> {
    log('entered getAssignees');
    return ({ projects, nextPageKey }: ProjectResponse) => {
      nextPageKey$.next(nextPageKey);

      if (!projects || !projects.length) {
        return of([]);
      }

      const projectIds = projects.map(project => project.projectId).join(',');
      return this.taskService.getCurrentTasks(assigneeId, assigneeId ? undefined : projectIds).pipe(
        tap(({ nextPageKey: nextPageTasksKey }) => nextPageTasksKey$.next(nextPageTasksKey)),
        concatMap(allTasks => {
          return forkJoin(
            projects.map(project =>
              this.projectService
                .getAllProjectMentees(project.projectId)
                .pipe(map(({ mentees }) => ({ project, mentees })))
            )
          ).pipe(
            map(projectApprentices => {
              // mentees
              const apprenticeMap: { [apprenticeId: string]: { mentee: Profile; projects: any[] } } = {};
              const result: ApprenticeProjectTasksSection[] = [];
              projectApprentices.forEach(({ project, mentees }) => {
                mentees.forEach((mentee: any) => {
                  const { userId: menteeId, status } = mentee;
                  const mapKey = `${menteeId}|${status}`;

                  if (!apprenticeMap[mapKey]) {
                    apprenticeMap[mapKey] = {
                      mentee,
                      projects: [],
                    };
                  }
                  apprenticeMap[mapKey].projects.push(project);
                });
              });
              Object.keys(apprenticeMap).forEach(apprenticeId => {
                const { mentee, projects } = apprenticeMap[apprenticeId];
                result.push({
                  apprenticeId,
                  apprenticeAvatarUrl: mentee.logoUrl,
                  apprenticeEmail: mentee.email,
                  apprenticeStatus: mentee.status,
                  apprenticeName: `${mentee.firstName} ${mentee.lastName}`,
                  apprenticeProjects: projects.map(project => ({
                    projectId: project.projectId,
                    projectName: project.name,
                    projectLogoUrl: project.logoUrl,
                    projectColor: `#${project.color}`,
                    projectTerms: project.programTerms,
                    projectTasks: allTasks.tasks
                      ? this.ammendTasks(
                          project,
                          allTasks.tasks.filter(task => {
                            return (
                              task.projectId === project.projectId && task.assigneeId === apprenticeId.split('|')[0]
                            );
                          }),
                          mentee.status
                        ).projectTasks
                      : [],
                    createdOn: project.createdOn,
                  })),
                });
              });
              return result;
            }),
            tap(() => {
              // this.isPageLoading = false;
            })
          );
        })
      );
    };
  }

  private apprenticesToProjects(apprentices: ApprenticeProjectTasksSection[]): ProjectTasksSection[] {
    const projects = apprentices.reduce(
      (allProjects, { apprenticeAvatarUrl: taskIcon, apprenticeProjects, apprenticeName }) => {
        apprenticeProjects.forEach(
          ({ projectId, projectName, projectColor, projectLogoUrl, projectTasks, createdOn }) => {
            if (!allProjects[projectId]) {
              allProjects[projectId] = {
                allTasks: [],
                projectColor,
                projectId,
                projectLogoUrl,
                projectName,
                createdOn,
              };
            }
            allProjects[projectId].allTasks.push(...projectTasks.map(task => ({ ...task, taskIcon, apprenticeName })));
          }
        );

        return allProjects;
      },
      {} as { [id: string]: ProjectTasksSection }
    );

    return Object.values(projects).reduce((all, project) => [...all, project], [] as any[]);
  }

  private projectsToApprenticeProjectTasksSection(
    apprenticeLoggedIn = false
  ): (projects: Project[]) => ApprenticeProjectTasksSection[] {
    const apprenitceId = localStorage.getItem('userId');

    if (!apprenitceId) {
      return () => [];
    }

    return (projects: Project[]) => {
      return [
        {
          apprenitceId,
          apprenticeLoggedIn,
          apprenticeProjects: projects.map(project => {
            const {
              apprenticeNeeds,
              // apprenticeNeeds: { programTerms: projectTerms },
              programTerms,
              color,
              projectId,
              logoUrl: projectLogoUrl,
              name: projectName,
              tasks,
              createdOn,
            } = project;

            return this.ammendTasks(
              {
                projectId,
                projectName,
                projectLogoUrl,
                projectColor: `#${color}`,
                projectTerms: programTerms,
                projectTasks: [],
                menteeStatus: project.menteeStatus,
                createdOn,
              },
              tasks,
              project.menteeStatus
            );
          }),
        },
      ];
    };
  }

  private sortProjects(
    key: 'projectName'
  ): (project1: ProjectWithTasks | ProjectTasksSection, project2: ProjectWithTasks | ProjectTasksSection) => number {
    return (project1: ProjectWithTasks | ProjectTasksSection, project2: ProjectWithTasks | ProjectTasksSection) => {
      if (this.sortOrder.includes('Ascending')) {
        return this.sortByString(project1[key], project2[key], true);
      } else if (this.sortOrder.includes('Descending')) {
        return this.sortByString(project1[key], project2[key], false);
      } else {
        return project1[key].localeCompare(project2[key]);
      }
    };
  }

  private sortMentees(
    key: 'apprenticeName'
  ): (
    apprentice1: ApprenticeProjectTasksSection | ApprenticeTasksSection,
    apprentice2: ApprenticeProjectTasksSection | ApprenticeTasksSection
  ) => number {
    return (
      apprentice1: ApprenticeProjectTasksSection | ApprenticeTasksSection,
      apprentice2: ApprenticeProjectTasksSection | ApprenticeTasksSection
    ) => {
      if (this.sortOrder.includes('Ascending')) {
        return this.sortByString(apprentice1[key] as string, apprentice2[key] as string, true);
      } else if (this.sortOrder.includes('Descending')) {
        return this.sortByString(apprentice1[key] as string, apprentice2[key] as string, false);
      } else {
        return (apprentice1[key] as string).localeCompare(apprentice2[key] as string);
      }
    };
  }

  private sortByString(a: string, b: string, isASC: boolean): number {
    return isASC
      ? a.toLocaleLowerCase() > b.toLocaleLowerCase()
        ? 1
        : -1
      : b.toLocaleLowerCase() > a.toLocaleLowerCase()
      ? 1
      : -1;
  }

  private sortApprentices(
    key: 'apprenticeName'
  ): (apprentice1: ApprenticeProjectTasksSection, apprentice2: ApprenticeProjectTasksSection) => number {
    return (apprentice1: ApprenticeProjectTasksSection, apprentice2: ApprenticeProjectTasksSection) =>
      (apprentice1[key] as string).localeCompare(apprentice2[key] as string);
  }

  private ammendTasks(project: ProjectWithTasks, tasks: Task[], apprenticeStatus: string = ''): ProjectWithTasks {
    log('entered ammendTasks');
    let displayedTasks = tasks;
    // filter mentor tasks if all prerequisite aren't complete
    const thereIsPrerequisiteTasksPending = tasks
      .filter(task => task.category === 'prerequisite')
      .some(task => {
        const completeStatus = ['complete', 'completed'];
        return !completeStatus.includes(task.status || '');
      });

    if (thereIsPrerequisiteTasksPending) {
      displayedTasks = tasks.filter(task => {
        if (['accepted', 'graduated', 'pending'].includes(apprenticeStatus)) {
          return true;
        }
        return task.category === 'prerequisite';
      });
    }
    return {
      ...project,
      projectTasks: displayedTasks.map(
        ({
          id: taskId,
          name: taskName,
          description: taskDescription,
          status: taskStatus,
          dueDate: taskDueDate,
          createdOn: taskCreatedOn,
          updatedOn: taskUpdatedOn,
          category,
          file,
          custom,
          ...extras
        }) => {
          return {
            taskId,
            taskName,
            taskCreatedOn,
            taskDescription,
            taskStatus: taskStatus as any,
            taskDueDate,
            taskUpdatedOn,
            taskCategory: category,
            menteeGraduated: apprenticeStatus === 'graduated',
            file,
            custom,
            submitFile: extras.submitFile,
          };
        }
      ),
    };
  }

  private hasValidMode(): boolean {
    return (!this.menteeId && this.isApprentice) || this.isAdmin;
  }

  private setupFilters(
    apprentices$: Observable<ApprenticeProjectTasksSection[]>,
    filter$: BehaviorSubject<(value: any) => boolean>,
    filterTasks$: BehaviorSubject<(value: any) => boolean>,
    sortBy$: BehaviorSubject<any>
  ): Observable<ApprenticeProjectTasksSection[]> {
    return combineLatest(apprentices$, filter$, filterTasks$, sortBy$).pipe(
      map(([apprentices, filterFunction, filterFunctionTasks]) =>
        apprentices.map(apprentice => ({
          ...apprentice,
          apprenticeProjects: apprentice.apprenticeProjects.filter(filterFunction).map(project => {
            return {
              ...project,
              projectTasks: project.projectTasks.filter(filterFunctionTasks),
            };
          }),
        }))
      )
    );
  }

  private validateTaskMentee(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      this.groupBy$.value === 'Project' && !this.currentTask
        ? this.validateNonEmptySelection(EMPTY_TASK_MENTEE)(control)
        : null;
  }

  private validateTaskProject(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      this.groupBy$.value === 'Mentee' && !this.currentTask
        ? this.validateNonEmptySelection(EMPTY_TASK_PROJECT)(control)
        : null;
  }

  private validateNonEmptySelection(emptyValue: string): ValidatorFn {
    return Validators.compose([
      Validators.required,
      ({ value }: AbstractControl): ValidationErrors | null => (value === emptyValue ? { empty: true } : null),
    ]) as ValidatorFn;
  }

  onSelectFile(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      this.taskFileData = event.target.files[0];
    }
  }
  closePicker(taskDueDatePicker: any) {
    taskDueDatePicker.close();
  }

  emptyTasksMessage() {
    return (!this.canShowApprentice && !this.canShowAssignees) || (this.isApprentice && !this.canShowApprentice);
  }

  onFileUpload(fileUploadStatus: boolean) {
    this.disableAction = fileUploadStatus;
  }

  getUniqueProjects(r: ProjectWithTasks[]) {
    const unique = [] as ProjectWithTasks[];
    for (let i = 0; i < r.length; i++) {
      if (unique.length === 0) {
        unique.push(r[i]);
      } else {
        if (!unique.some(s => s.projectId === r[i].projectId)) {
          unique.push(r[i]);
        }
      }
    }
    return unique;
  }

  jumpTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canJumpTop() {
    return !this.emptyTasksMessage();
  }
}
