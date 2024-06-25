// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Project, Task, Mentor, LocalProgramTerm, ProgramTerm } from '@app/models/project.model';
import { ProjectService } from '@app/services/project.service';
import { CustomValidators } from '@app/shared/validators';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  NgbTypeahead,
  NgbModal,
  NgbActiveModal,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { SkillsService } from '../../../../services/skills.service';
import { environment } from 'environments/environment';
import {
  MAX_TASK_NAME_LENGTH,
  MAX_TASK_DESCRIPTION_LENGTH,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  PROJECT_DEFAULT_SORT_NAME,
  ORDER_BY_ASCENDING,
} from '@app/core/constants';
import { TermAddEditComponent } from '@app/shared/term-add-edit/term-add-edit.component';
import { textFieldLengthObserver } from '@app/core/utilities/text-length';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { ValidateTitleNotTaken } from './create-project.validators';
import { AlertType, CoreState, QueueAlertAction } from '@app/core';
import { Store } from '@ngrx/store';
import { PaginationService } from '@app/services/pagination.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-maintainer',
  templateUrl: './maintainer.component.html',
  styleUrls: ['./maintainer.component.scss'],
})
export class MaintainerComponent implements OnInit, OnDestroy {
  readonly cii: AbstractControl;
  readonly maxTaskNameLength = MAX_TASK_NAME_LENGTH;
  readonly maxTaskDescriptionLength = MAX_TASK_DESCRIPTION_LENGTH;
  readonly minTitleLength = MIN_TITLE_LENGTH;
  readonly maxTitleLength = MAX_TITLE_LENGTH;
  readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
  readonly titleLength$: Observable<number>;
  readonly descriptionLength$: Observable<number>;
  readonly PRIVATE_PROJECT_PAGINATE_ENDPOINT = `${environment.API_URL}projects/cache/private`;

  protected readonly unsubscribe$ = new Subject<void>();

  activeTermIndex?: number;
  activeModal?: NgbActiveModal;
  pageSubmitted = false;
  formSubmitted = false;
  submitBtnLabel = 'Submit';
  submissionFailed = false;
  hasProjectId = false;
  isCustomTermSelected = false;
  projectId = '';
  project$ = new Subject<Project>();
  project: any = {};
  ciiProjectID = '';
  ciiStatus = undefined;
  subscription: any;
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;
  currentDate = new Date();
  ciiControl?: AbstractControl;
  ciiValue = '';

  public newProjectForm = new FormGroup({
    formPage1: new FormGroup({
      projectName: new FormControl(
        '',
        [Validators.required, Validators.maxLength(this.maxTitleLength), Validators.minLength(this.minTitleLength)],
        ValidateTitleNotTaken.createValidator(this.projectService)
      ),
      projectPitch: new FormControl('', [Validators.required, Validators.maxLength(this.maxDescriptionLength)]),
      projectRepoLink: new FormControl('', [Validators.required, CustomValidators.url]),
      websiteUrl: new FormControl('', CustomValidators.url),
      projectCIIProjectId: new FormControl(''),
      projectCodeConductURL: new FormControl('', [CustomValidators.url]),
      projectColor: new FormControl(''),
      projectLogo: new FormControl('', Validators.required),
    }),
    formPage3: new FormGroup({
      projectTaskCodingChallenge: new FormControl(''),
      projectTaskCodingChallengeURL: new FormControl('', CustomValidators.url),
      projectTaskResume: new FormControl(''),
      projectTaskCoverLetter: new FormControl(''),
      projectTaskSEV: new FormControl(''),
      projectTaskPP: new FormControl(''),
      projectTasks: new FormArray([]),
      termsConditions: new FormControl('', Validators.requiredTrue),
    }),
  });

  public projectTermsList: LocalProgramTerm[] = [];

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

  currentPage: number;
  topicTypeahead: any;

  @ViewChild('topicTypeahead', { static: true })
  set topicTypeAhead(v: NgbTypeahead) {
    this.topicTypeahead = v;
  }

  topicFocus$ = new Subject<string>();
  topicClick$ = new Subject<string>();

  projectSkills: any[] = [];
  projectIndustry: any[] = [];
  projectMentors: { name: string; email: string }[] = [];
  skills = [
    {
      tagType: 'Skill Name',
    },
  ];
  industry = [
    {
      tagType: 'Technologies',
    },
  ];
  mentors = [
    {
      tagType: 'Name',
      labelText: 'Name',
    },
    {
      tagType: 'Email',
      labelText: 'Email',
    },
  ];

  get formPage1() {
    return this.newProjectForm.get('formPage1') as FormGroup;
  }

  get projectName() {
    return this.formPage1.get('projectName') as FormControl;
  }

  get projectRepoLink() {
    return this.formPage1.get('projectRepoLink') as FormControl;
  }

  get websiteUrl() {
    return this.formPage1.get('websiteUrl') as FormControl;
  }

  get projectCIIProjectId() {
    return this.formPage1.get('projectCIIProjectId') as FormControl;
  }

  get projectCodeConductURL() {
    return this.formPage1.get('projectCodeConductURL') as FormControl;
  }

  get projectColor() {
    return this.formPage1.get('projectColor') as FormControl;
  }

  get projectLogo() {
    return this.formPage1.get('projectLogo') as FormControl;
  }

  get projectPitch() {
    return this.formPage1.get('projectPitch') as FormControl;
  }

  get formPage3() {
    return this.newProjectForm.get('formPage3') as FormGroup;
  }

  get projectTaskCodingChallenge() {
    return this.formPage3.get('projectTaskCodingChallenge') as FormControl;
  }

  get projectTaskCodingChallengeURL() {
    return this.formPage3.get('projectTaskCodingChallengeURL') as FormControl;
  }

  get projectTaskResume() {
    return this.formPage3.get('projectTaskResume') as FormControl;
  }
  get projectTaskCoverLetter() {
    return this.formPage3.get('projectTaskCoverLetter') as FormControl;
  }
  get projectTaskSEV() {
    return this.formPage3.get('projectTaskSEV') as FormControl;
  }
  get projectTaskPP() {
    return this.formPage3.get('projectTaskPP') as FormControl;
  }

  get termsConditions() {
    return this.formPage3.get('termsConditions') as FormControl;
  }

  get projectTasks() {
    const formPage3: FormGroup = this.newProjectForm.get('formPage3') as FormGroup;
    return formPage3.get('projectTasks') as FormArray;
  }

  parentProject: Project | undefined;
  myProjects: Project[] = [];
  isLoadMyProjects = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private projectService: ProjectService,
    private skillsService: SkillsService,
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private paginationService: PaginationService,
    private store: Store<CoreState>,
    private modalService: NgbModal,
    private ngbDateParserFormatter: NgbDateParserFormatter
  ) {
    this.currentPage = 0;
    this.pageSubmitted = false;
    this.hasProjectId = false;
    this.isCustomTermSelected = false;
    this.cii = this.projectCIIProjectId;

    this.titleLength$ = textFieldLengthObserver(this.projectName);
    this.descriptionLength$ = textFieldLengthObserver(this.projectPitch);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.projectId = routeParams.id;
      if (this.projectId === undefined) {
        return;
      }

      this.projectService.getProject(this.projectId).subscribe(this.project$);

      this.project$.subscribe(results => {
        if (results.projectId) {
          this.project = results;
          this.hasProjectId = true;
          this.projectName.setValue(this.project.name);
          this.projectRepoLink.setValue(this.project.repoLink);
        }
      });
    });
    this.getMyProjects();

    this.ciiControl = this.formPage1.get('projectCIIProjectId') as AbstractControl;
    this.validateCII(this.ciiControl as FormControl);
  }

  private getMyProjects() {
    this.isLoadMyProjects = true;
    this.paginationService
      .getPage(
        this.PRIVATE_PROJECT_PAGINATE_ENDPOINT,
        new HttpParams(),
        0,
        1000,
        PROJECT_DEFAULT_SORT_NAME,
        ORDER_BY_ASCENDING
      )
      .subscribe(
        (data: any) => {
          const { hits, total } = data;
          const myProjects = new Array<any>();
          hits.forEach((item: any) => {
            myProjects.push(item._source);
          });
          this.myProjects = myProjects;
          this.isLoadMyProjects = false;
        },
        error => {
          this.isLoadMyProjects = false;
        }
      );
  }

  inheritFromExistProject(project: Project) {
    this.parentProject = project;
    this.projectMentors = [];
    this.projectService.getEditProjectMentors(project.projectId).subscribe(results => {
      this.projectMentors = results.mentors;
    });
    this.prepopulateForm(project);
  }

  private prepopulateForm(project: Project) {
    this.projectName.patchValue(project.name);
    this.projectRepoLink.patchValue(project.repoLink);
    this.websiteUrl.patchValue(project.websiteUrl);
    this.projectPitch.patchValue(project.description);

    this.projectCIIProjectId.patchValue(project.projectCIIProjectId || '');
    this.projectCodeConductURL.patchValue(project.codeOfConduct);
    this.projectColor.patchValue('FFFFFF');
    this.projectLogo.patchValue(project.logoUrl);

    if (project.apprenticeNeeds && project.apprenticeNeeds.skills) {
      this.projectSkills = [];
      project.apprenticeNeeds.skills.forEach((skill: string) => {
        this.projectSkills.push({ name: skill });
      });
    }

    if (project.industry) {
      const industry = project.industry.split(',');
      this.projectIndustry = [];
      industry.forEach((cat: string) => {
        this.projectIndustry.push({ name: cat });
      });
    }
    if (project.programTerms) {
      this.setProjectTermsList(project.programTerms);
    }

    if (project.taskTemplates) {
      project.taskTemplates.forEach(task => {
        if (task.custom === 'true') {
          const formattedDueDate = {
            year: 0,
            month: 0,
            day: 0,
          };

          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            formattedDueDate.year = dueDate.getFullYear();
            formattedDueDate.month = dueDate.getMonth() + 1;
            formattedDueDate.day = dueDate.getDate();
          }
          this.projectTasks.push(
            this.formBuilder.group({
              id: uuidv4(),
              taskName: new FormControl(task.name, [Validators.required, Validators.maxLength(this.maxTaskNameLength)]),
              dueDate: new FormControl(formattedDueDate, [Validators.required]),
              taskDescription: new FormControl(task.description, [
                Validators.required,
                Validators.maxLength(this.maxTaskDescriptionLength),
              ]),
              submitFile: new FormControl(task.submitFile === 'required'),
            })
          );
        } else {
          switch (task.name) {
            case 'Resume':
              this.projectTaskResume.patchValue(true);
              break;
            case 'Cover Letter':
              this.projectTaskCoverLetter.patchValue(true);
              break;
            case 'School Enrollment Verification':
              this.projectTaskSEV.patchValue(true);
              break;
            case 'Participation permission from school or employer':
              this.projectTaskPP.patchValue(true);
              break;
            case 'Coding Challenge':
              this.projectTaskCodingChallenge.patchValue(true);
              this.projectTaskCodingChallengeURL.patchValue(task.description);
              break;
          }
        }
      });
    }
  }

  private setProjectTermsList(programTerms: ProgramTerm[]) {
    this.projectTermsList = [];
    programTerms.filter(term => {
      const projectTermObj = {
        id: term.id,
        name: term.name,
        startYear: new Date(+term.startDateTime * 1000).getUTCFullYear().toString(),
        startMonth: this.months[new Date(+term.startDateTime * 1000).getUTCMonth()],
        endMonth: this.months[new Date(+term.endDateTime * 1000).getUTCMonth()],
        endYear: new Date(+term.endDateTime * 1000).getUTCFullYear().toString(),
        Active: term.Active,
        activeUsers: term.activeUsers,
      };
      this.projectTermsList.push(projectTermObj);
    });
  }

  validateCII(control: FormControl) {
    control.valueChanges
      .pipe(
        debounceTime(300),
        tap(async val => {
          if (val && val !== '') {
            if (this.isNotDigit(val)) {
              control.setErrors({ '404': true });
              this.ciiStatus = undefined;
              return;
            } else {
              const isValid = await this.projectService.checkBadge(val);
              if (isValid) {
                control.setErrors(null);
              } else {
                control.setErrors({ '404': true });
                this.ciiStatus = undefined;
              }
            }
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        this.ciiValue = this.isNotDigit(value) ? undefined : value;
      });
  }

  isNotDigit(entry: string) {
    const reg = new RegExp('^\\d+$');
    return reg.test(entry) === false;
  }

  onSkillListChange(listArray: Array<any>) {
    console.log('Skill list count', listArray.length);
  }

  onMentorListChange(listArray: Array<any>) {
    console.log('Mentor list validity', listArray.length);
  }

  validate(): Boolean {
    switch (this.currentPage) {
      case 0:
        return this.formPage1.valid && this.projectIndustry.length > 0 && this.ciiValidation();
      case 1:
        return this.projectSkills.length > 0 && this.projectMentors.length > 0 && this.projectTermsList.length > 0;
      case 2:
        return this.formPage3.valid && this.atLeastOneTaskSpecified();
      default:
        return false;
    }
  }

  ciiValidation() {
    if (this.projectCIIProjectId.value !== '') {
      return this.ciiStatus !== undefined;
    } else {
      return true;
    }
  }

  validatefields(formArray: FormArray) {
    const controlAsFormArray = formArray;
    controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => {
      this.validateAllFormFields(arrayControl);
    });
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  atLeastOneTaskSpecified(): boolean {
    if (
      this.projectTaskResume.value === true ||
      this.projectTaskCoverLetter.value === true ||
      this.projectTaskSEV.value === true ||
      this.projectTaskPP.value === true ||
      (this.projectTaskCodingChallenge.value === true && this.projectTaskCodingChallengeURL.value !== '') ||
      this.projectTasks.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  cancel() {
    if (confirm('You will lose your changes—are you sure you wish to cancel?')) {
      this.router.navigate(['/']);
    }
  }

  back() {
    this.currentPage--;
    window.scrollTo(0, 0);
  }

  next() {
    if (this.validate()) {
      this.pageSubmitted = false;
      this.currentPage++;
      window.scrollTo(0, 0);
    } else {
      this.pageSubmitted = true;
    }
  }

  submit() {
    if (this.validate()) {
      this.pageSubmitted = false;
      this.formSubmitted = true;
      this.submissionFailed = false;
      this.submitBtnLabel = 'Submitting...';
      const project: Project = {
        projectId: '',
        name: this.projectName.value,
        status: '',
        industry: this.projectIndustry
          .map(function(skillObj: any) {
            return skillObj.name;
          })
          .join(','),
        description: this.projectPitch.value,
        projectCIIProjectId: this.projectCIIProjectId.value,
        color: 'FFFFFF',
        repoLink: this.projectRepoLink.value,
        websiteUrl: this.websiteUrl.value,
        apprenticeNeeds: {
          skills: this.projectSkills.map(function(skillObj: any) {
            return skillObj.name;
          }),
          mentors: this.projectMentors.map(function(mentor: any) {
            const mentorObj: Mentor = {
              name: mentor.name,
              email: mentor.email,
            };
            return mentorObj;
          }),
        },
        programTerms: this.convertProjectTermsList(),
        logoUrl: this.projectLogo.value,
        codeOfConduct: this.projectCodeConductURL.value,
        tasks: [],
        termsAndConditions: !!this.termsConditions.value,
      };

      if (this.projectTaskResume.value) {
        project.tasks.push(this.createTask('Resume', 'Upload the most recent version of your resume.', 'false'));
      }
      if (this.projectTaskCoverLetter.value) {
        project.tasks.push(
          this.createTask(
            'Cover Letter',
            `A letter to the program covering the following topics: \n
        - How did you find out about our mentorship program?
        - Why are you interested in this program?
        - What experience and knowledge/skills do you have that are applicable to this program?
        - What do you hope to get out of this mentorship experience?`,
            'false'
          )
        );
      }
      if (this.projectTaskSEV.value) {
        project.tasks.push(
          this.createTask(
            'School Enrollment Verification',
            `Students must upload proof of enrollment (college transcript, or copy student ID, 
          or admissions offer if graduating from high school)`,
            'false'
          )
        );
      }
      if (this.projectTaskPP.value) {
        project.tasks.push(
          this.createTask(
            'Participation permission from school or employer',
            `By submitting this task, I certify that I have permission
          from my school or employer to participate in this mentorship program.`,
            'false'
          )
        );
      }

      if (this.projectTaskCodingChallenge.value && this.projectTaskCodingChallengeURL.value) {
        project.tasks.push(this.createTask('Coding Challenge', this.projectTaskCodingChallengeURL.value, 'false'));
      }

      this.projectTasks.controls.forEach((taskControl: any) => {
        project.tasks.push(
          this.createTask(
            taskControl.get('taskName').value,
            taskControl.get('taskDescription').value,
            'true',
            taskControl.get('dueDate').value,
            taskControl.get('submitFile').value === true ? 'required' : ''
          )
        );
      });

      this.projectService.addProject(project).subscribe(
        results => {
          this.router.navigate(['participate/maintainer/submitted']);
          this.store.dispatch(
            new QueueAlertAction({ alertText: 'Program Created Successfully.', alertType: AlertType.SUCCESS })
          );
        },
        error => {
          this.pageSubmitted = true;
          this.formSubmitted = false;
          this.submitBtnLabel = 'Submit';
          this.submissionFailed = true;
        }
      );
    } else {
      this.pageSubmitted = true;
      this.formSubmitted = false;
      this.submissionFailed = false;
    }
  }

  createTask(name: string, description: string, custom: string, dueDate?: NgbDateStruct, submitFile?: string): Task {
    const newTask: Task = {
      name,
      description,
      progressPercentage: 0,
      estimatedTime: '',
      completionDate: '',
      priority: '',
      custom,
      category: 'prerequisite',
      dueDate: dueDate ? this.ngbDateParserFormatter.format(dueDate) : '',
      submitFile,
    };
    return newTask;
  }

  addTask() {
    this.projectTasks.push(
      this.formBuilder.group({
        taskName: new FormControl('', [Validators.required, Validators.maxLength(this.maxTaskNameLength)]),
        dueDate: new FormControl('', [Validators.required, this.dueDateValidator()]),
        taskDescription: new FormControl('', [
          Validators.required,
          Validators.maxLength(this.maxTaskDescriptionLength),
        ]),
        submitFile: new FormControl(''),
      })
    );
  }

  deleteTask(index: number) {
    this.projectTasks.removeAt(index);
  }

  async openAddTerm() {
    const modalRef = this.modalService.open(TermAddEditComponent, {
      centered: true,
      windowClass: 'no-border modal-window',
    });

    const addTermComp = modalRef.componentInstance as TermAddEditComponent;
    const result = await modalRef.result;
    if (result && result.status) {
      this.projectTermsList.push(result.data[0]);
    }
  }

  async openEditTerm(term: LocalProgramTerm, index: number) {
    const modalRef = this.modalService.open(TermAddEditComponent, {
      centered: true,
      windowClass: 'no-border modal-window',
    });

    const addTermComp = modalRef.componentInstance as TermAddEditComponent;
    addTermComp.itemEdit = term;
    const result = await modalRef.result;
    if (result && result.status) {
      this.projectTermsList[index] = result.data[0];
    }
  }

  deleteTerm(deleteTerm: any, index: any) {
    this.activeTermIndex = index;
    this.activeModal = this.modalService.open(deleteTerm, { ariaLabelledBy: 'Create Task', windowClass: 'task-modal' });
  }

  modalDeleteTerm() {
    if (this.activeTermIndex !== undefined) {
      this.projectTermsList.splice(this.activeTermIndex, 1);
    }
    if (this.activeModal) {
      this.activeModal.close();
    }
  }

  onCancel() {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }
  convertProjectTermsList() {
    const newProjectTermsList: any[] = [];
    this.projectTermsList.filter(term => {
      const projectTermObj = {
        name: term.name,
        startDateTime: parseInt(
          (new Date(+term.startYear, this.months.indexOf(term.startMonth) + 1, -15).getTime() / 1000).toFixed(0),
          10
        ),
        endDateTime: parseInt(
          (new Date(+term.endYear, this.months.indexOf(term.endMonth) + 1, -15).getTime() / 1000).toFixed(0),
          10
        ),
      };
      newProjectTermsList.push(projectTermObj);
    });
    return newProjectTermsList;
  }

  closePicker(taskDueDatePicker: any) {
    taskDueDatePicker.close();
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
}
