// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '@app/../environments/environment';
import { FileUploadService } from '@app/core/file-upload.service';
import { Project } from '@app/models/project.model';
import { Profile } from '@app/models/user.model';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';
import { CustomValidators } from '@app/shared/validators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { MENTOR_INTRODUCTION_PLACEHOLDER } from '@app/core/constants';

@Component({
  selector: 'app-mentor',
  templateUrl: './mentor.component.html',
  styleUrls: ['./mentor.component.scss'],
})
export class MentorComponent implements OnInit {
  readonly mentorIntroductionPlaceholder = MENTOR_INTRODUCTION_PLACEHOLDER;

  public form = new FormGroup({});
  readonly firstNameControl: AbstractControl;
  readonly lastNameControl: AbstractControl;
  readonly emailControl: AbstractControl;
  readonly introductionControl: AbstractControl;
  readonly linkedInUrlControl: AbstractControl;
  readonly githubUrlControl: AbstractControl;
  readonly termsConditionsControl: AbstractControl;
  pageSubmitted = false;
  formSubmitted = false;
  submitBtnLabel = 'Submit';
  hasProjectId = false;
  existingProject = false;
  projectId = '';
  project$ = new Subject<Project>();
  project: any = {};
  activeTerms: string[] = [];
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;
  isProjectListActive = false;
  defaultLogoUrl = '';

  skills: any[] = [
    {
      tagType: 'Skill Name',
    },
  ];

  projects = [
    {
      tagType: 'Select LFX Mentorship',
    },
  ];

  selectedProjects: { name: string; value: string; status?: string }[] = [];
  initialSelectedProjects: { name: string; value: string; status: string }[] = [];
  projectsList: { name: string; value: string }[];

  jobSkills: any[] = [];

  get resumeControl() {
    return this.form.get('profileLinks.resumeUrl');
  }

  projectTypeahead: any;

  @ViewChild('projectTypeahead')
  set projectTypeAhead(v: NgbTypeahead) {
    this.projectTypeahead = v;
  }

  readonly projectClick$ = new Subject<string>();
  readonly projectFocus$ = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private activeRoute: ActivatedRoute,
    private projectService: ProjectService
  ) {
    this.projectsList = [];
    this.pageSubmitted = false;
    this.hasProjectId = false;
    this.form = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      introduction: ['', [Validators.required]],
      logoUrl: [''],
      userType: [''],
      termsConditions: ['', [Validators.requiredTrue]],
      profileLinks: this.formBuilder.group({
        linkedInUrl: ['', CustomValidators.url],
        githubUrl: ['', CustomValidators.url],
        resumeUrl: [''],
      }),
    });

    this.firstNameControl = this.form.controls['firstName'];
    this.lastNameControl = this.form.controls['lastName'];
    this.emailControl = this.form.controls['email'];
    this.introductionControl = this.form.controls['introduction'];
    this.termsConditionsControl = this.form.controls['termsConditions'];
    this.githubUrlControl = this.form.get('profileLinks.githubUrl') as AbstractControl;
    this.linkedInUrlControl = this.form.get('profileLinks.linkedInUrl') as AbstractControl;
  }

  ngOnInit() {
    this.projectService.getProjectsForList('').subscribe(projects => {
      if (projects && projects.length > 0) {
        projects.map((project: any) => this.projectsList.push({ name: project.name, value: project.projectId }));
      }
    });

    // this.activeRoute.params.subscribe(routeParams => {
    //   this.projectId = routeParams.id;
    //   if (this.projectId) {
    //     this.projectService.getProject(this.projectId).subscribe(this.project$);

    //     this.project$.subscribe(results => {
    //       if (results.projectId) {
    //         this.project = results;
    //         this.hasProjectId = true;

    //         this.initialSelectedProjects.push({
    //           name: this.project.projectName,
    //           value: this.project.projectId,
    //           status: 'added',
    //         });
    //         this.selectedProjects = [...this.initialSelectedProjects];
    //       }
    //     });
    //   }
    // });

    this.authService.userProfile$.subscribe((userProfile: any) => {
      if (!this.authService.loggedIn) {
        return this.router.navigate(['/']);
      }
      if (localStorage.getItem('isMentor') === 'true') {
        return this.router.navigate(['/'], { fragment: 'my-account' });
      } else {
        if (userProfile) {
          this.firstNameControl.setValue(userProfile.given_name || '');
          this.lastNameControl.setValue(userProfile.family_name || '');
          this.emailControl.setValue(userProfile.email || '');
          this.defaultLogoUrl = userProfile.picture || '';
        }
      }

      this.userService.getMentorProjects(localStorage.getItem('userId') || '').subscribe(res => {
        if (res) {
          const projects = res.map((project: any) => {
            return { name: project.name, value: project.id, status: project.status };
          });
          this.initialSelectedProjects = [...projects];
          this.selectedProjects = [...this.initialSelectedProjects];
        }
      });
    });
  }

  validate() {
    return this.form.valid && this.jobSkills.length > 0;
  }

  back() {
    if (confirm('You will lose your changes—are you sure you wish to cancel?')) {
      this.router.navigate(['']);
    }
  }

  submit() {
    if (this.validate()) {
      this.pageSubmitted = false;
      this.formSubmitted = true;
      this.submitBtnLabel = 'Submitting...';
      const logoControl = this.form.get('logoUrl') as AbstractControl;
      const resumeControl = this.resumeControl as AbstractControl;
      forkJoin(
        this.fileUploadService.uploadFile(logoControl.value),
        this.fileUploadService.uploadFile(resumeControl.value)
      )
        .pipe(
          switchMap(([logoUrl, resumeUrl]) => {
            const userProfileRequest: Profile = {
              firstName: this.form.value.firstName,
              lastName: this.form.value.lastName,
              email: this.form.value.email,
              type: 'mentor',
              logoUrl: logoUrl,
              introduction: this.form.value.introduction,
              skillSet: {
                skills: this.jobSkills.map((skill: any) => skill.name),
              },
              profileLinks: {
                githubProfileLink: this.form.value.profileLinks.githubUrl,
                linkedinProfileLink: this.form.value.profileLinks.linkedInUrl,
                resumeLink: resumeUrl,
              },
              profileProjects: this.selectedProjects.map((proj: any) => {
                return { name: proj.name, id: proj.value };
              }),
              termsAndConditions: !!this.form.value.termsConditions,
            };
            return this.userService.createUserProfile(userProfileRequest);
          })
        )
        .subscribe(() => {
          localStorage.setItem('isMentor', 'true');
          this.router.navigate(['participate/mentor/submitted'], { queryParams: { joined: false, newMentor: true } });
        });
    } else {
      this.pageSubmitted = true;
    }
  }

  handleFileChange(event: Event) {
    const resumeControl = this.resumeControl;
    if (!resumeControl) {
      return;
    }
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const selectedFile = target && target.files && target.files[0];
    resumeControl.setValue(selectedFile, { emitEvent: false });
  }

  constructSelectedProjects(projectList: { name: string; value: string; status?: string }[]) {
    this.selectedProjects = projectList.filter(proj => {
      if (!proj.value) {
        return;
      }
      const wasAddedBefore = this.initialSelectedProjects.find(internalProject => {
        return internalProject.value === proj.value;
      });
      if (wasAddedBefore) {
        proj.status = wasAddedBefore.status;
      } else {
        proj.status = 'requested';
      }
      return proj;
    });
  }

  loadAction(status: string) {
    return status === 'added' ? 'Remove From Program' : 'Withdraw Request';
  }

  removeProject(project: { name: string; value: string; status?: string }) {
    this.selectedProjects = this.selectedProjects.filter(proj => proj.value !== project.value);
  }
}
