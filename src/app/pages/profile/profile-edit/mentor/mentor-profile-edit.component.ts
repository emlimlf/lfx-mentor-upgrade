// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user.service';
import { FileUploadService } from '@app/core/file-upload.service';
import { forkJoin, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Profile } from '@app/models/user.model';
import { CustomValidators } from '@app/shared/validators';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { DownloadService } from '@app/services/download.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MENTOR_INTRODUCTION_PLACEHOLDER } from '@app/core/constants';

@Component({
  selector: 'app-profile-edit-mentor',
  styleUrls: ['./mentor-profile-edit.component.scss'],
  templateUrl: './mentor-profile-edit.component.html',
})
export class MentorProfileEditComponent implements OnInit {
  readonly mentorIntroductionPlaceholder = MENTOR_INTRODUCTION_PLACEHOLDER;
  readonly form = new FormGroup({});

  // Form fields
  readonly firstName: FormControl;
  readonly lastName: FormControl;
  readonly email: FormControl;
  readonly introduction: FormControl;
  readonly logoUrl: FormControl;
  readonly userType: FormControl;
  readonly profileLinks: FormGroup;
  readonly linkedInUrl: FormControl;
  readonly githubUrl: FormControl;
  readonly resumeUrl: FormControl;

  // Control variables
  public submitBtnLabel = 'Submit';
  public pageSubmitted: boolean;
  public formSubmitted: boolean;
  public logoUrlValue?: string;
  public resumeUrlValue?: string;
  public skills: any[] = [
    {
      tagType: 'Skill Name',
    },
  ];
  public jobSkills: any[];

  hasProjectId = false;
  existingProject = false;

  readonly projectClick$ = new Subject<string>();
  readonly projectFocus$ = new Subject<string>();

  projects = [
    {
      tagType: 'Select LFX Mentorship',
    },
  ];
  selectedProjects: { name: string; value: string; status?: string }[] = [];
  initialSelectedProjects: { name: string; value: string; status?: string }[] = [];
  projectsList: { name: string; value: string }[];
  defaultLogoUrl: SafeResourceUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private projectService: ProjectService,
    private fileUploadService: FileUploadService,
    private downloadService: DownloadService,
    private authService: AuthService
  ) {
    this.projectsList = [];
    this.pageSubmitted = false;
    this.formSubmitted = false;
    this.form = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      introduction: ['', [Validators.required]],
      logoUrl: [''],
      userType: [''],
      profileLinks: this.formBuilder.group({
        linkedInUrl: ['', CustomValidators.url],
        githubUrl: ['', CustomValidators.url],
        resumeUrl: [''],
      }),
    });

    this.firstName = this.form.controls['firstName'] as FormControl;
    this.lastName = this.form.controls['lastName'] as FormControl;
    this.email = this.form.controls['email'] as FormControl;
    this.introduction = this.form.controls['introduction'] as FormControl;
    this.logoUrl = this.form.controls['logoUrl'] as FormControl;
    this.userType = this.form.controls['userType'] as FormControl;
    this.profileLinks = this.form.controls['profileLinks'] as FormGroup;
    this.linkedInUrl = this.profileLinks.controls['linkedInUrl'] as FormControl;
    this.githubUrl = this.profileLinks.controls['githubUrl'] as FormControl;
    this.resumeUrl = this.profileLinks.controls['resumeUrl'] as FormControl;
    this.jobSkills = [];
  }

  ngOnInit() {
    const userId = localStorage.getItem('userId') as string;

    // Check if userId is set
    if (userId === null) {
      this.router.navigate(['profile']);
      return;
    }

    // Check if user has mentor profile
    if (localStorage.getItem('isMentor') !== 'true') {
      this.router.navigate(['profile']);
      return;
    }

    this.userService.getPrivateProfileByType(userId, 'mentor').subscribe(profileResponse => {
      this.authService.userProfile$.subscribe((userProfile: any) => {
        this.defaultLogoUrl =
          this.downloadService._defaultLogo({
            first: userProfile.firstName,
            last: userProfile.lastName,
          }) || userProfile.picture;
      });
      this.prePopulateForm(profileResponse);
    });

    this.projectService.getProjectsForList('').subscribe(projects => {
      if (projects && projects.length > 0) {
        projects.map((project: any) => this.projectsList.push({ name: project.name, value: project.projectId }));
      }
    });
  }

  back() {
    if (confirm('You will lose your changes—are you sure you wish to cancel?')) {
      this.router.navigate(['/'], { fragment: 'my-account' });
    }
  }

  private prePopulateForm(profile: Profile) {
    this.firstName.patchValue(profile.firstName);
    this.lastName.patchValue(profile.lastName);
    this.email.patchValue(profile.email);
    this.introduction.patchValue(profile.introduction);

    this.logoUrl.patchValue(profile.logoUrl || '');
    this.logoUrlValue = profile.logoUrl;

    this.userType.patchValue(profile.type);

    if (profile.profileProjects) {
      this.initialSelectedProjects = profile.profileProjects.map(proj => {
        return { name: proj.name, value: proj.id, status: proj.status };
      });
      this.selectedProjects = [...this.initialSelectedProjects];
    }

    if (profile.profileLinks) {
      this.linkedInUrl.patchValue(profile.profileLinks.linkedinProfileLink);
      this.githubUrl.patchValue(profile.profileLinks.githubProfileLink);
      this.resumeUrlValue = profile.profileLinks.resumeLink as string;
    }
    if (profile.skillSet) {
      profile.skillSet.skills.forEach(skill => {
        this.jobSkills.push({ name: skill });
      });
    }
  }

  validate() {
    return this.form.valid && this.jobSkills.length > 0;
  }

  submit() {
    if (this.validate()) {
      this.submitBtnLabel = 'Saving...';
      this.formSubmitted = true;
      this.pageSubmitted = false;
      const logoControl = this.logoUrl as AbstractControl;
      const resumeControl = this.resumeUrl as AbstractControl;

      if (!this.logoUrl.value) {
        this.logoUrlValue = '';
      }

      forkJoin(
        logoControl.value instanceof Blob
          ? this.fileUploadService.uploadFile(logoControl.value as File)
          : of(this.logoUrlValue),
        this.fileUploadService.uploadFile(resumeControl.value)
      )
        .pipe(
          switchMap(([logoUrl, resumeUrl]) => {
            const userProfileRequest: Profile = {
              firstName: this.form.value.firstName,
              lastName: this.form.value.lastName,
              email: this.form.value.email,
              type: 'mentor',
              logoUrl: logoUrl || this.logoUrlValue,
              introduction: this.form.value.introduction,
              skillSet: {
                skills: this.jobSkills.map((skill: any) => skill.name),
              },
              profileLinks: {
                githubProfileLink: this.form.value.profileLinks.githubUrl,
                linkedinProfileLink: this.form.value.profileLinks.linkedInUrl,
                resumeLink: resumeUrl ? resumeUrl : this.resumeUrlValue,
              },
              profileProjects: this.selectedProjects.map(({ name, value }) => {
                return { name, id: value };
              }),
            };
            return this.userService.updateUserProfile(userProfileRequest, 'mentor');
          })
        )
        .subscribe(
          () => {
            this.router.navigate(['/'], { fragment: 'my-account' });
          },
          err => {
            console.log('err', err);
            this.formSubmitted = false;
            this.submitBtnLabel = 'Submit';
          }
        );
    } else {
      this.pageSubmitted = true;
    }
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
