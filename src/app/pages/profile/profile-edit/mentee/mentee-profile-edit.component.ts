// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CustomValidators } from '@app/shared/validators';
import { Profile } from '@app/models/user.model';
import { UserService } from '@app/services/user.service';
import { FileUploadService } from '@app/core/file-upload.service';
import {
  PHONE_NUMBER_PATTERN,
  MIN_PHONE_NUMBER_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MENTEE_INTRODUCTION_PLACEHOLDER,
} from '@app/core/constants';
import { CoreState, QueueAlertAction, AlertType } from '@app/core';
import { DownloadService } from '@app/services/download.service';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-profile-edit-mentee',
  styleUrls: ['./mentee-profile-edit.component.scss'],
  templateUrl: './mentee-profile-edit.component.html',
})
export class MenteeProfileEditComponent implements OnInit, OnDestroy {
  readonly minPhoneNumberLength = MIN_PHONE_NUMBER_LENGTH;
  readonly maxPhoneNumberLength = MAX_PHONE_NUMBER_LENGTH;
  readonly menteeIntroductionPlaceholder = MENTEE_INTRODUCTION_PLACEHOLDER;

  editMenteeForm: FormGroup;
  currentStep = 0;
  pageSubmitted = false;
  formSubmitted = false;
  isUnitedStatesSelected = false;
  specificRaceOpen = false;
  submitBtnLabel = 'Submit';
  profile$ = new Subject<Profile>();
  profile: any = {};
  originalValues: any = {};
  allSkills: any[] = [];
  improvementSkills: any[] = [];
  skills: any[] = [];
  avatarUrl?: string;
  defaultLogoUrl = '';

  currentSkills = [
    {
      tagType: 'Skill Name',
    },
  ];

  skillsToImproveOn = [
    {
      tagType: 'Skill Name',
    },
  ];

  racesQuestion = {
    question: 'What is your racial or ethnic identity?',
    options: [
      {
        text: 'Select',
        value: '',
      },
      {
        text: 'White',
        value: 'white',
      },
      {
        text: 'Hispanic or Latino',
        value: 'hispanicOrLatino',
      },
      {
        text: 'Black or African-American',
        value: 'blackOrAfricanAmerican',
      },
      {
        text: 'American Indian or Alaskan Native',
        value: 'americanIndianOrAlaskanNative',
      },
      {
        text: 'Asian',
        value: 'asian',
      },
      {
        text: 'Native Hawaiian or other Pacific islander',
        value: 'NativeHawaiianOrOtherPacificIslander',
      },
      {
        text: 'Two or more races',
        value: 'twoOrMoreRaces',
      },
      {
        text: `I don't want to provide`,
        value: 'IDonotWantToProvide',
      },
    ],
  };

  ageQuestion = {
    question: 'How old are you?',
    options: [
      {
        text: 'Select',
        value: '',
      },
      {
        text: '19 or younger',
        value: '-19',
      },
      {
        text: '20-39',
        value: '20-39',
      },
      {
        text: '40-60',
        value: '40-60',
      },
      {
        text: '61 or older',
        value: '61 or older',
      },
      {
        text: `I don't want to provide`,
        value: 'IDonotWantToProvide',
      },
    ],
  };
  genderQuestion = {
    question: 'Which gender do you identify with?',
    options: [
      {
        text: 'Select',
        value: '',
      },
      {
        text: 'Male',
        value: 'male',
      },
      {
        text: 'Female',
        value: 'female',
      },
      {
        text: 'Non-binary',
        value: 'nonBinary',
      },
      {
        text: `I don't want to provide`,
        value: 'IDonotWantToProvide',
      },
    ],
  };
  incomeConsentQuestion = {
    question: 'Which socioeconomic class do you identify with?',
    options: [
      {
        text: 'Select',
        value: '',
      },
      {
        text: 'Working class',
        value: 'workingClass',
      },
      {
        text: 'Lower middle class',
        value: 'lowerMiddleClass',
      },
      {
        text: 'Upper middle class',
        value: 'upperMiddleClass',
      },
      {
        text: 'Upper class',
        value: 'upperClass',
      },
      {
        text: `I don't want to provide`,
        value: 'IDonotWantToProvide',
      },
    ],
  };
  educationLevelQuestion = {
    question: 'What is your education level?',
    options: [
      {
        text: 'Select',
        value: '',
      },
      {
        text: 'Some high school',
        value: 'someHighSchool',
      },
      {
        text: 'Some college/technical training',
        value: 'someCollege',
      },
      {
        text: 'Completed college',
        value: 'college',
      },
      {
        text: `Completed master's degree`,
        value: 'masters',
      },
      {
        text: 'Completed Ph.D',
        value: 'phd',
      },
      {
        text: `I don't want to provide`,
        value: 'IDonotWantToProvide',
      },
    ],
  };
  consentText = 'I consent to use of this information for the purpose listed above.';
  public savedResumeUrl = '';
  private unsubscribe$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private downloadService: DownloadService,
    private fileUploadService: FileUploadService,
    private store: Store<CoreState>,
    private router: Router,
    private authService: AuthService
  ) {
    this.pageSubmitted = false;
    this.editMenteeForm = new FormGroup({
      formPage1: new FormGroup({
        // first section
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [
          Validators.required,
          Validators.minLength(this.minPhoneNumberLength),
          Validators.maxLength(this.maxPhoneNumberLength),
          Validators.pattern(PHONE_NUMBER_PATTERN),
        ]),
        logoUrl: new FormControl(''),
        introduction: new FormControl('', [Validators.required]),

        // second section
        address1: new FormControl('', Validators.required),
        address2: new FormControl(''),
        country: new FormControl('', Validators.required),
        state: new FormControl('', this.validateState.bind(this) as ValidatorFn),
        city: new FormControl('', Validators.required),
        zipCode: new FormControl('', Validators.required),

        // third section
        // workAuthorized: new FormControl('', Validators.required),

        // fourth section
        githubUrl: new FormControl('', CustomValidators.url),
        linkedInUrl: new FormControl('', CustomValidators.url),
        resumeUrl: new FormControl(''),
      }),
      formPage2: new FormGroup({
        comments: new FormControl(''),
      }),
      formPage3: new FormGroup({
        age: new FormControl({ value: '', disabled: false }),
        race: new FormControl({ value: '', disabled: false }),
        gender: new FormControl({ value: '', disabled: false }),
        householdIncome: new FormControl({ value: '', disabled: false }),
        educationLevel: new FormControl({ value: '', disabled: false }),
      }),
    });
  }

  get formPage1(): FormGroup {
    return this.editMenteeForm.get('formPage1') as FormGroup;
  }

  get formPage2(): FormGroup {
    return this.editMenteeForm.get('formPage2') as FormGroup;
  }

  get formPage3(): FormGroup {
    return this.editMenteeForm.get('formPage3') as FormGroup;
  }

  get firstName(): FormControl {
    return this.formPage1.get('firstName') as FormControl;
  }

  get lastName(): FormControl {
    return this.formPage1.get('lastName') as FormControl;
  }

  get email(): FormControl {
    return this.formPage1.get('email') as FormControl;
  }

  get logoUrl(): FormControl {
    return this.formPage1.get('logoUrl') as FormControl;
  }

  get introduction(): FormControl {
    return this.formPage1.get('introduction') as FormControl;
  }

  get phone(): FormControl {
    return this.formPage1.get('phone') as FormControl;
  }

  get address1(): FormControl {
    return this.formPage1.get('address1') as FormControl;
  }

  get address2(): FormControl {
    return this.formPage1.get('address2') as FormControl;
  }

  get country(): FormControl {
    return this.formPage1.get('country') as FormControl;
  }

  get state(): FormControl {
    return this.formPage1.get('state') as FormControl;
  }

  get city(): FormControl {
    return this.formPage1.get('city') as FormControl;
  }

  get zipCode(): FormControl {
    return this.formPage1.get('zipCode') as FormControl;
  }

  // get workAuthorized(): FormControl {
  //   return this.formPage1.get('workAuthorized') as FormControl;
  // }

  get githubUrl(): FormControl {
    return this.formPage1.get('githubUrl') as FormControl;
  }

  get linkedInUrl(): FormControl {
    return this.formPage1.get('linkedInUrl') as FormControl;
  }

  get resumeUrl(): FormControl {
    return this.formPage1.get('resumeUrl') as FormControl;
  }

  get comments(): FormControl {
    return this.formPage2.get('comments') as FormControl;
  }

  get age(): FormControl {
    return this.formPage3.get('age') as FormControl;
  }

  get race(): FormControl {
    return this.formPage3.get('race') as FormControl;
  }

  get gender(): FormControl {
    return this.formPage3.get('gender') as FormControl;
  }

  get householdIncome(): FormControl {
    return this.formPage3.get('householdIncome') as FormControl;
  }

  get educationLevel(): FormControl {
    return this.formPage3.get('educationLevel') as FormControl;
  }

  get termsConditions(): FormControl {
    return this.formPage3.get('termsConditions') as FormControl;
  }

  ngOnInit() {
    const userId = localStorage.getItem('userId') as string;

    this.userService
      .getPrivateProfileByType(userId, 'apprentice')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(this.prepopulateForm.bind(this));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private prepopulateForm(profile: Profile) {
    this.originalValues = profile;
    this.originalValues.demographics = this.originalValues.demographics || {};
    this.originalValues.socioeconomics = this.originalValues.socioeconomics || {};
    this.firstName.patchValue(profile.firstName);
    this.lastName.patchValue(profile.lastName);
    this.email.patchValue(profile.email);
    this.phone.patchValue(profile.phone);
    this.introduction.patchValue(profile.introduction);
    this.logoUrl.patchValue(profile.logoUrl || '');
    this.avatarUrl = profile.logoUrl;
    this.defaultLogoUrl = this.downloadService._defaultLogo({ first: profile.firstName, last: profile.lastName });

    // if (profile.workAuthorized) {
    //   this.workAuthorized.patchValue('Yes');
    // } else {
    //   this.workAuthorized.patchValue('No');
    // }

    if (profile.address) {
      this.address1.patchValue(profile.address.address1);
      this.address2.patchValue(profile.address.address2);
      this.country.patchValue(profile.address.country);
      if (profile.address.country === 'US') {
        this.openStatesFields();
      }
      this.city.patchValue(profile.address.city);
      this.state.patchValue(profile.address.state);
      this.zipCode.patchValue(profile.address.zipCode);
    }

    if (profile.profileLinks) {
      this.githubUrl.patchValue(profile.profileLinks.githubProfileLink);
      this.linkedInUrl.patchValue(profile.profileLinks.linkedinProfileLink);
      this.savedResumeUrl = profile.profileLinks.resumeLink as string;
    }

    if (profile.skillSet) {
      if (profile.skillSet && profile.skillSet.skills) {
        profile.skillSet.skills.forEach(skill => {
          this.skills.push({ name: skill });
        });
      }

      if (profile.skillSet && profile.skillSet.improvementSkills) {
        profile.skillSet.improvementSkills.forEach(skill => {
          this.improvementSkills.push({ name: skill });
        });
      }

      this.comments.patchValue(profile.skillSet.comments);

      if (profile.demographics) {
        this.age.patchValue(profile.demographics.age || '');
        this.race.patchValue(profile.demographics.race || '');
        this.gender.patchValue(profile.demographics.gender || '');
      }

      if (profile.socioeconomics) {
        this.householdIncome.patchValue(profile.socioeconomics.income || '');
        this.educationLevel.patchValue(profile.socioeconomics.educationLevel || '');
      }
    }
  }

  private validateState(state: FormControl): ValidationErrors | null {
    if (!this.editMenteeForm || !this.formPage1 || this.country.value !== 'US') {
      return null;
    }

    return Validators.required(state);
  }

  validate(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.formPage1.valid;
      case 1:
        return this.formPage2.valid && this.improvementSkills.length > 0 && this.skills.length > 0;
      case 2:
        return this.formPage3.valid;
      default:
        return false;
    }
  }

  back() {
    this.currentStep--;
    window.scrollTo(0, 0);
  }

  next() {
    if (this.validate()) {
      this.pageSubmitted = false;
      this.currentStep++;
      window.scrollTo(0, 0);
    } else {
      this.pageSubmitted = true;
    }
  }

  cancel() {
    if (confirm('You will lose your changes—are you sure you wish to cancel?')) {
      this.downloadService.selectedFile = undefined;
      this.router.navigate(['/'], { fragment: 'my-account' });
    }
  }

  submit() {
    this.submitBtnLabel = 'Saving...';
    this.formSubmitted = true;
    if (this.validate()) {
      this.pageSubmitted = false;
      const logoControl = this.logoUrl as AbstractControl;
      const resumeControl = this.resumeUrl as AbstractControl;

      if (!this.logoUrl.value) {
        this.avatarUrl = '';
      }

      forkJoin(
        logoControl.value instanceof Blob
          ? this.fileUploadService.uploadFile(logoControl.value as File)
          : of(this.avatarUrl),
        this.fileUploadService.uploadFile(resumeControl.value)
      )
        .pipe(
          switchMap(([logoUrl, resumeUrl]) => {
            this.savedResumeUrl = resumeUrl === '' ? this.savedResumeUrl : resumeUrl;
            const userProfileRequest: Profile = {
              firstName: this.firstName.value,
              lastName: this.lastName.value,
              email: this.email.value,
              type: 'mentee',
              phone: this.phone.value,
              logoUrl: logoUrl || this.avatarUrl,
              introduction: this.introduction.value,
              address: {
                address1: this.address1.value,
                address2: this.address2.value,
                country: this.country.value,
                state: this.state.value,
                city: this.city.value,
                zipCode: this.zipCode.value,
              },
              // workAuthorized: this.workAuthorized.value.search(/yes/gi) > -1 ? true : false,
              profileLinks: {
                githubProfileLink: this.githubUrl.value,
                linkedinProfileLink: this.linkedInUrl.value,
                resumeLink: resumeUrl ? resumeUrl : this.savedResumeUrl,
              },
              skillSet: {
                skills: this.skills.map((skill: any) => skill.name),
                improvementSkills: this.improvementSkills.map((skill: any) => skill.name),
                comments: this.comments.value,
              },
              demographics: {
                age: this.age.value,
                race: this.race.value,
                gender: this.gender.value,
              },
              socioeconomics: {
                income: this.householdIncome.value,
                educationLevel: this.educationLevel.value,
              },
            };

            return this.userService.updateUserProfile(userProfileRequest, 'apprentice');
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          newMentee => {
            this.store.dispatch(new QueueAlertAction({ alertText: 'Profile Updated.', alertType: AlertType.SUCCESS }));
            this.downloadService.selectedFile = undefined;
            this.formSubmitted = false;
            localStorage.setItem('apprenticeSkills', this.skills.map((skill: any) => skill.name).join(','));
            localStorage.setItem(
              'apprenticeImprovementSkills',
              this.improvementSkills.map((skill: any) => skill.name).join(',')
            );
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
      this.formSubmitted = false;
    }
  }

  openSpecificRace(isOtherRace: boolean) {
    this.specificRaceOpen = isOtherRace;
  }

  openStatesFields() {
    if (this.country.value === 'US') {
      this.isUnitedStatesSelected ? (this.isUnitedStatesSelected = false) : (this.isUnitedStatesSelected = true);

      if (!this.isUnitedStatesSelected) {
        this.state.disable();
      } else {
        this.state.enable();
      }
    } else {
      this.isUnitedStatesSelected = false;
      this.state.disable();
    }
  }

  toggleDemographic(control: FormControl) {
    control.disabled ? control.enable() : control.disable();
  }
}
