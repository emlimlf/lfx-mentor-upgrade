import { to } from 'await-to-js';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { factoryLog } from '@app/services/debug.service';
import { Profile } from '@app/models/user.model';
import { ProjectWithTasks, ProjectTasksSection, Task } from '@app/models/project.model';
import { AbstractControl, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, Subscription, throwError, Subject } from 'rxjs';
import { TaskView, ApprenticeProjectTasksSection } from '@app/shared/tasks/tasks/tasks.component';
import { SubmitState } from '@app/shared';
import { tap, delay, map, catchError, throttleTime } from 'rxjs/operators';
import { SUBMIT_CLOSE_DELAY_MS } from '@app/core';
import { TaskService } from '@app/services/task.service';
import { TasksHelperService } from '@app/shared/tasks/tasks/tasks-helpers.service';
import { FileUploadService } from '@app/core/file-upload.service';

const log = factoryLog('MenteesTabAddTasksComponent');

const EMPTY_TASK_PROJECT = 'none';
const EMPTY_TASK_MENTEE = 'none';
const ALL_TASK_MENTEE = 'allTaskMentee';

@Component({
  selector: 'app-mentees-tab-add-tasks',
  templateUrl: './mentees-tab-add-tasks.component.html',
  styleUrls: ['./mentees-tab-add-tasks.component.scss'],
  providers: [NgbActiveModal],
})
export class MenteesTabAddTasksComponent implements OnInit, OnDestroy {
  @Output() added: EventEmitter<any> = new EventEmitter();
  @Output() error: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  errorOnSubmit = '';

  private clicks = new Subject();
  subscription: Subscription;
  sortOrder: string[];
  hasAccepted: boolean = false;
  taskFileData?: File;
  newTaskForm: FormGroup;
  currentTask?: TaskView;
  submitFile: FormControl;
  profiles: Profile[] = [];
  taskName: AbstractControl;
  taskFile: AbstractControl;
  taskMentee: AbstractControl;
  taskStatus: AbstractControl;
  taskDueDate: AbstractControl;
  taskProject: AbstractControl;
  activeModal?: NgbActiveModal;
  taskDescription: AbstractControl;

  taskSubmitted: any = false;

  currentProjectId = '';
  currentAssigneeId = '';

  readonly submitState = SubmitState;
  readonly groupBy$ = new BehaviorSubject<'Project' | 'Mentee' | undefined>(undefined);
  readonly submitState$ = new BehaviorSubject<SubmitState>(SubmitState.READY);
  readonly apprentices$ = new BehaviorSubject<ApprenticeProjectTasksSection[]>([]);
  readonly assignees$ = new BehaviorSubject<ApprenticeProjectTasksSection[]>([]);
  readonly status$ = new BehaviorSubject<string>('');
  readonly currentDate = new Date(Date.now());

  constructor(
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private taskService: TaskService,
    private tasksHelperService: TasksHelperService,
    private fileUploadService: FileUploadService
  ) {
    this.subscription = new Subscription();
    this.newTaskForm = new FormGroup({
      taskName: new FormControl('', Validators.required),
      taskDueDate: new FormControl('', this.dueDateValidator()),
      taskDescription: new FormControl('', Validators.required),
      submitFile: new FormControl(''),
      taskFile: new FormControl(''),
      taskMentee: new FormControl(ALL_TASK_MENTEE, this.validateTaskMentee()),
      taskProject: new FormControl(EMPTY_TASK_PROJECT, this.validateTaskProject()),
      taskStatus: new FormControl(''),
    });
    this.taskName = this.newTaskForm.controls['taskName'];
    this.taskDueDate = this.newTaskForm.controls['taskDueDate'];
    this.taskDescription = this.newTaskForm.controls['taskDescription'];
    this.taskStatus = this.newTaskForm.controls['taskStatus'];
    this.taskMentee = this.newTaskForm.controls['taskMentee'];
    this.taskProject = this.newTaskForm.controls['taskProject'];
    this.taskFile = this.newTaskForm.controls['taskFile'];
    this.sortOrder = ['Ascending'];
    this.submitFile = this.newTaskForm.get('submitFile') as FormControl;
  }

  async ngOnInit() {
    this.trackSubmission();
    this.taskMentee.statusChanges.subscribe(
      () => (this.currentAssigneeId = this.taskMentee.valid ? this.taskMentee.value : '')
    );
    this.checkStatus();
  }

  async ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  checkStatus() {
    for (let i = 0; i < this.assignees$.value.length; i++) {
      if (this.assignees$.value[i].apprenticeStatus && this.assignees$.value[i].apprenticeStatus === 'accepted') {
        this.hasAccepted = true;
        break;
      }
    }
  }
  trackSubmission() {
    this.subscription = this.clicks
      .pipe(
        tap((e: any) => {
          (e.target as HTMLButtonElement).disabled = true;
          this.submitState$.next(SubmitState.SUBMITTING);
        }),
        throttleTime(1000)
      )
      .subscribe(e => this.doSubmission(e));
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

  getRelevantProjects(): ProjectWithTasks[] {
    const projects = this.assignees$.value
      .filter(({ apprenticeId }: any) => apprenticeId === this.currentAssigneeId)
      .reduce((all: any, { apprenticeProjects }: any) => [...all, ...apprenticeProjects], [] as ProjectWithTasks[])
      .sort(this.sortProjects('projectName'));
    return this.getUniqueProjects(projects);
  }
  getRelevantAssignees(): ApprenticeProjectTasksSection[] {
    return this.assignees$.value.filter(({ apprenticeProjects }: any) =>
      apprenticeProjects.map(({ projectId }: any) => projectId).includes(this.currentProjectId)
    );
  }

  getActiveAssignees(): ApprenticeProjectTasksSection[] {
    return this.assignees$.value.filter(
      x =>
        (x.apprenticeStatus && x.apprenticeStatus.includes('accepted')) ||
        (x.apprenticeStatus && x.apprenticeStatus.includes('pending'))
    );
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

  private sortByString(a: string, b: string, isASC: boolean): number {
    return isASC
      ? a.toLocaleLowerCase() > b.toLocaleLowerCase()
        ? 1
        : -1
      : b.toLocaleLowerCase() > a.toLocaleLowerCase()
      ? 1
      : -1;
  }

  // Safe event handling...
  beginSubmission(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.taskSubmitted = true;
    if (this.newTaskForm.valid) {
      setTimeout(() => {
        this.clicks.next(event);
      });
    } else {
      let { value, valid } = this.newTaskForm.controls['taskDueDate'];
      // alert(`val: ${value}`);
      // alert(`state: ${valid}`);
      this.error.emit('invalid');
    }
  }

  doSubmission(event: any): Subscription | undefined {
    log('entered doSubmission');
    const taskProjectId = this.currentProjectId;
    const assignedTo = this.currentAssigneeId === ALL_TASK_MENTEE ? '' : this.currentAssigneeId;
    if (this.newTaskForm.valid && taskProjectId) {
      const task: Task = {
        name: this.taskName.value,
        description: this.taskDescription.value,
        dueDate: this.ngbDateParserFormatter.format(this.taskDueDate.value),
        status: 'pending',
        projectId: taskProjectId,
        assigneeId: assignedTo,
        ownerId: localStorage.getItem('userId') || '',
        category: 'nonPrerequisite',
        submitFile: this.tasksHelperService.getSubmitFileValueFromCheckbox(this.submitFile.value),
      };
      if (this.taskFileData) {
        return this.fileUploadService.uploadFile(this.taskFileData).subscribe(taskFile => {
          task.file = taskFile;
          return this.submitTask(task, event);
        });
      } else {
        log('data to submit', { task });
        return this.submitTask(task, event);
      }
    }
    log('Task not submitted');
    this.taskSubmitted = true;
  }

  submitTask(task: Task, event: any) {
    log('entered submitTask');
    task.custom = 'undefined';
    return this.taskService
      .createTask(task)
      .pipe(
        tap(async data => {
          this.submitState$.next(SubmitState.SUCCESS);
          setTimeout(() => {
            this.added.emit({ assigneeId: data.assigneeId });
          }, 500);

          if (task.projectId) {
            const [taskErr, response] = await to(this.taskService.getSubmittedAssignees(task.projectId).toPromise());
            const assignees = response ? response : [];
            const controls = this.taskService.statusControls;
            this.taskService.submittedSubject.next({ assignees, controls });
          }
        }),
        delay(SUBMIT_CLOSE_DELAY_MS),
        map(() => {
          return this.activeModal as NgbActiveModal;
        }),
        catchError(error => {
          this.submitState$.next(SubmitState.READY);
          this.error.emit('runtime');
          return throwError(error);
        })
      )
      .subscribe(() => {
        this.currentAssigneeId = '';
        this.close.emit();
      });
  }

  initTask({ projectId, apprenticeId }: { projectId?: string; apprenticeId?: string } = {}) {
    log('entered initTask');
    this.currentProjectId = projectId || '';
    const { value: groupBy } = this.groupBy$;
    this.taskSubmitted = false;
    this.taskFileData = undefined;
    Object.values(this.newTaskForm.controls).forEach(control => control.reset());
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

    if (apprenticeId) {
      this.currentAssigneeId = apprenticeId;
    }
    if (groupBy) {
      let items: string[] | undefined;
      let control: AbstractControl | undefined;
      if (groupBy === 'Mentee') {
        items = this.getRelevantProjects().map(({ projectId }: any) => projectId);
        control = this.taskProject;
      } else {
        items = this.getRelevantAssignees().map(({ apprenticeId }: any) => apprenticeId as string);
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
  }

  onCancel() {
    this.close.emit();
  }
}
