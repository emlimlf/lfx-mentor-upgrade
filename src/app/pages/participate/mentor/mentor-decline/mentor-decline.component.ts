// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user.service';
import { FileUploadService } from '@app/core/file-upload.service';
import { switchMap } from 'rxjs/operators';
import { Profile } from '@app/models/user.model';
import { CustomValidators } from '@app/shared/validators';
import { ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, forkJoin } from 'rxjs';
import { Project } from '@app/models/project.model';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { environment } from 'environments/environment';
import { QueueAlertAction, AlertType, CoreState } from '@app/core';
import { MENTOR_INTRODUCTION_PLACEHOLDER } from '@app/core/constants';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-mentor-decline',
  templateUrl: './mentor-decline.component.html',
  styleUrls: ['./mentor-decline.component.scss'],
})
export class MentorDeclineComponent implements OnInit {
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
  hasMentorProfile = true;
  projectId = '';
  joinKey = '';
  project$ = new Subject<Project>();
  project: any = {};
  activeTerms: string[] = [];
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;

  skills = [
    {
      tagType: 'Skill Name',
    },
  ];
  jobSkills = [];
  joinToken = '';

  get resumeControl() {
    return this.form.get('profileLinks.resumeUrl');
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private activeRoute: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private store: Store<CoreState>
  ) {
    this.pageSubmitted = false;
    this.form = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      introduction: ['', [Validators.required]],
      logoUrl: ['', [Validators.required]],
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
    this.githubUrlControl = this.form.get('profileLinks.githubUrl') as AbstractControl;
    this.linkedInUrlControl = this.form.get('profileLinks.linkedInUrl') as AbstractControl;
    this.termsConditionsControl = this.form.controls['termsConditions'];
  }

  ngOnInit() {
    combineLatest(this.activeRoute.params, this.activeRoute.queryParams).subscribe(values => {
      this.joinToken = values[1]['token'];
      this.projectId = values[0]['projectId'];

      this.projectService.getProject(this.projectId).subscribe(this.project$);
      this.project$.subscribe(results => {
        if (!results.projectId) {
          this.store.dispatch(
            new QueueAlertAction({ alertText: 'That project does not exist!', alertType: AlertType.ERROR })
          );
          return this.router.navigate(['/']);
        }

        this.project = results;

        this.authService.isAuthenticated$.subscribe(loggedIn => {
          if (!loggedIn) {
            return this.router.navigate(['/']);
          }

          this.projectService.declineMyMentorship(this.projectId, this.joinToken).subscribe(
            () => {
              this.router.navigate(['participate/mentor/submitted/' + this.projectId], {
                queryParams: { joined: false, newMentor: false, decline: true },
              });
            },
            error => {
              if (error.status === 404) {
                this.router.navigate(['participate/mentor/submitted/' + this.projectId], {
                  queryParams: {
                    joined: false,
                    newMentor: false,
                    notAllowed: true,
                  },
                });
              } else {
                this.store.dispatch(
                  new QueueAlertAction({
                    alertText: 'Unfortunately, something went wrong. Please try again!',
                    alertType: AlertType.ERROR,
                  })
                );
                this.router.navigate(['']);
              }
            }
          );
        });
      });
    });
  }

  validate() {
    return this.form.valid && this.jobSkills.length > 0;
  }

  back() {
    if (confirm('You will lose your changes - are you sure you wish to cancel?')) {
      this.router.navigate(['/']);
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
              logoUrl,
              introduction: this.form.value.introduction,
              skillSet: {
                skills: this.jobSkills.map((skill: any) => skill.name),
              },
              profileLinks: {
                githubProfileLink: this.form.value.profileLinks.githubUrl,
                linkedinProfileLink: this.form.value.profileLinks.linkedInUrl,
                resumeLink: resumeUrl,
              },
              projectDetails: {
                name: '',
                repositoryUrl: '',
                maintainerName: '',
                maintainerEmail: '',
              },
              termsAndConditions: !!this.form.value.termsConditions,
            };
            return this.userService.createUserProfile(userProfileRequest);
          })
        )
        .subscribe(() => {
          this.projectService.addMeAsMentor(this.projectId, this.joinToken).subscribe(
            () => {
              localStorage.setItem('isMentor', 'true');
              this.router.navigate(['participate/mentor/submitted/' + this.projectId], {
                queryParams: { joined: true, newMentor: true },
              });
            },
            error => {
              if (error.status === 404) {
                this.router.navigate(['participate/mentor/submitted/' + this.projectId], {
                  queryParams: {
                    joined: false,
                    newMentor: true,
                    notAllowed: true,
                  },
                });
              }
            }
          );
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
}
