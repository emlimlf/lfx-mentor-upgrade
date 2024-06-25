// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { CustomValidators } from '@app/shared/validators';
import { Project, ProjectCard } from '@app/models/project.model';
import { Profile } from '@app/models/user.model';
import { UserService } from '@app/services/user.service';
import { AuthService } from '@app/services/auth.service';
import { ProjectService } from '@app/services/project.service';
import { FileUploadService } from '@app/core/file-upload.service';
import { environment } from 'environments/environment';

import hexRgb from 'hex-rgb';
import {
  PHONE_NUMBER_PATTERN,
  MIN_PHONE_NUMBER_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MENTEE_INTRODUCTION_PLACEHOLDER,
} from '@app/core/constants';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-apprentice',
  templateUrl: './apprentice.component.html',
  styleUrls: ['./apprentice.component.scss'],
})
export class ApprenticeComponent implements OnInit, OnDestroy {
  readonly minPhoneNumberLength = MIN_PHONE_NUMBER_LENGTH;
  readonly maxPhoneNumberLength = MAX_PHONE_NUMBER_LENGTH;
  readonly menteeIntroductionPlaceholder = MENTEE_INTRODUCTION_PLACEHOLDER;

  public form: FormGroup;
  public eligibilityForm: FormGroup;
  currentStep = 0;
  pageSubmitted = false;
  formSubmitted = false;
  submitBtnLabel = 'Submit';
  public viewingSingleSkill = false;
  public selectedSkill = '';
  public isUnitedStatesSelected = false;
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;
  skillMatchLoaded = false;
  alreadyMentee = false;
  destroy$ = new Subject<void>();
  avatarUrl?: string;
  defaultLogoUrl = '';
  private projectId?: string | null; // optional Project to join along with profile creation
  isPageLoading = false;

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

  allSkills: any[] = [];

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
  improvementSkills: any[] = [];
  skills: any[] = [];

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

  eligibilityQ1Value: any;
  eligibilityQ2Value: any;
  eligibilityQ3Value: any;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private projectService: ProjectService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private downloadService: DownloadService
  ) {
    this.pageSubmitted = false;
    this.form = new FormGroup({
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
        state: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        zipCode: new FormControl('', Validators.required),

        // fourth section
        githubUrl: new FormControl('', CustomValidators.url),
        linkedInUrl: new FormControl('', CustomValidators.url),
        resumeUrl: new FormControl(''),
      }),
      formPage2: new FormGroup({
        comments: new FormControl(''),
      }),
      formPage3: new FormGroup({
        age: new FormControl({ value: '', disabled: true }, Validators.required),
        ageConsent: new FormControl(''),
        race: new FormControl({ value: '', disabled: true }, Validators.required),
        raceConsent: new FormControl(''),
        gender: new FormControl({ value: '', disabled: true }, Validators.required),
        genderConsent: new FormControl(''),
        householdIncome: new FormControl({ value: '', disabled: true }, Validators.required),
        incomeConsent: new FormControl(''),
        educationLevel: new FormControl({ value: '', disabled: true }, Validators.required),
        educationConsent: new FormControl(''),
        termsConditions: new FormControl('', Validators.requiredTrue),
      }),
    });
    this.eligibilityForm = new FormGroup({
      eligibilityQ1: new FormControl(''),
      eligibilityQ2: new FormControl(''),
      eligibilityQ3: new FormControl(''),
    });
  }

  get formPage1(): FormGroup {
    return this.form.get('formPage1') as FormGroup;
  }

  get formPage2(): FormGroup {
    return this.form.get('formPage2') as FormGroup;
  }

  get formPage3(): FormGroup {
    return this.form.get('formPage3') as FormGroup;
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

  get phone(): FormControl {
    return this.formPage1.get('phone') as FormControl;
  }

  get introduction(): FormControl {
    return this.formPage1.get('introduction') as FormControl;
  }

  get logoUrl(): FormControl {
    return this.formPage1.get('logoUrl') as FormControl;
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

  get ageConsent(): FormControl {
    return this.formPage3.get('ageConsent') as FormControl;
  }

  get race(): FormControl {
    return this.formPage3.get('race') as FormControl;
  }

  get raceConsent(): FormControl {
    return this.formPage3.get('raceConsent') as FormControl;
  }

  get gender(): FormControl {
    return this.formPage3.get('gender') as FormControl;
  }

  get genderConsent(): FormControl {
    return this.formPage3.get('genderConsent') as FormControl;
  }

  get householdIncome(): FormControl {
    return this.formPage3.get('householdIncome') as FormControl;
  }

  get incomeConsent(): FormControl {
    return this.formPage3.get('incomeConsent') as FormControl;
  }

  get educationLevel(): FormControl {
    return this.formPage3.get('educationLevel') as FormControl;
  }

  get educationConsent(): FormControl {
    return this.formPage3.get('educationConsent') as FormControl;
  }

  get termsConditions(): FormControl {
    return this.formPage3.get('termsConditions') as FormControl;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    // If the user is already an apprentice, go to the matching project page
    if (localStorage.getItem('isApprentice') === 'true') {
      this.route.queryParamMap.subscribe(queryParams => {
        this.projectId = queryParams.get('projectId');

        if (this.projectId) {
          this.isPageLoading = true;
          // Moves user to project applied page
          this.projectService.addMeAsApprentice(this.projectId).subscribe(
            () => {
              this.isPageLoading = false;
              this.router.navigate(['/project/applied/']);
            },
            err => {
              if (err.status === 409) {
                this.isPageLoading = false;
              }
            }
          );
        }
      });

      if (localStorage.getItem('apprenticeSkills') !== null) {
        let apprenticeSkills: any = localStorage.getItem('apprenticeSkills');
        apprenticeSkills = apprenticeSkills.toString();
        if (apprenticeSkills) {
          apprenticeSkills = apprenticeSkills.split(',');
          this.skills = apprenticeSkills.map((s: string) => {
            return { name: s };
          });
        }
      }

      if (localStorage.getItem('apprenticeImprovementSkills') !== null) {
        let apprenticeImprovementSkills: any = localStorage.getItem('apprenticeImprovementSkills');
        apprenticeImprovementSkills = apprenticeImprovementSkills.toString();
        if (apprenticeImprovementSkills) {
          apprenticeImprovementSkills = apprenticeImprovementSkills.split(',');
          this.improvementSkills = apprenticeImprovementSkills.map((s: string) => {
            return { name: s };
          });
        }
      }

      // JOB-1890 - Redirect to profile instead of displaying the skill-wise projects.
      // this.getMatchingProjects();
      this.alreadyMentee = true;
      this.currentStep = 3;
      this.eligibilityQ1Value = 'yes';
      this.eligibilityQ2Value = 'yes';
      this.eligibilityQ3Value = 'no';

      this.router.navigate(['/'], { fragment: 'my-account' });
    }

    this.route.queryParamMap.subscribe(queryParams => {
      this.projectId = queryParams.get('projectId');
    });

    this.authService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((userProfile: any) => {
      if (userProfile) {
        this.firstName.setValue(userProfile.given_name || '');
        this.lastName.setValue(userProfile.family_name || '');
        this.email.setValue(userProfile.email || '');
        this.avatarUrl = userProfile.picture;
        this.logoUrl.setValue(userProfile.picture || '');
        this.defaultLogoUrl = this.downloadService._defaultLogo({
          first: userProfile.given_name,
          last: userProfile.family_name,
        });
      }
    });
  }

  viewOneSkill(skillName: string) {
    this.viewingSingleSkill = true;
    this.selectedSkill = skillName;
  }

  closeOneSkill() {
    this.viewingSingleSkill = false;
    this.selectedSkill = '';
  }

  validate(): boolean {
    if (this.eligibilityQ1Value === 'yes' && this.eligibilityQ2Value === 'yes' && this.eligibilityQ3Value === 'no') {
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
    } else {
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
      this.router.navigate(['/']);
    }
  }

  submit() {
    if (this.validate()) {
      this.pageSubmitted = false;
      this.formSubmitted = true;
      this.submitBtnLabel = 'Submitting...';
      const logoControl = this.logoUrl as AbstractControl;
      const resumeControl = this.resumeUrl as AbstractControl;

      forkJoin(
        logoControl.value instanceof Blob
          ? this.fileUploadService.uploadFile(logoControl.value as File)
          : of(this.avatarUrl),
        this.fileUploadService.uploadFile(resumeControl.value)
      )
        .pipe(
          switchMap(([logoUrl, resumeUrl]) => {
            const userProfileRequest: Profile = {
              firstName: this.firstName.value,
              lastName: this.lastName.value,
              email: this.email.value,
              type: 'apprentice',
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
              profileLinks: {
                githubProfileLink: this.githubUrl.value,
                linkedinProfileLink: this.linkedInUrl.value,
                resumeLink: resumeUrl || '',
              },
              skillSet: {
                skills: this.skills.map((skill: any) => skill.name),
                improvementSkills: this.improvementSkills.map((skill: any) => skill.name),
                comments: this.comments.value,
              },
              demographics: {
                age: this.ageConsent.value ? this.age.value : '',
                race: this.raceConsent.value ? this.race.value : '',
                gender: this.genderConsent.value ? this.gender.value : '',
              },
              socioeconomics: {
                income: this.incomeConsent.value ? this.householdIncome.value : '',
                educationLevel: this.educationConsent.value ? this.educationLevel.value : '',
              },
              termsAndConditions: !!this.termsConditions.value,
            };

            if (this.projectId) {
              userProfileRequest.joinProjectId = this.projectId;
            }

            return this.userService.createUserProfile(userProfileRequest);
          })
        )
        .subscribe(
          newApprentice => {
            localStorage.setItem('isApprentice', 'true');
            localStorage.setItem('apprenticeSkills', this.skills.map((skill: any) => skill.name).join(','));
            localStorage.setItem(
              'apprenticeImprovementSkills',
              this.improvementSkills.map((skill: any) => skill.name).join(',')
            );

            if (this.projectId) {
              // Moves user to project applied page
              this.router.navigate(['/project/applied/']);
            } else {
              // Moves user to project matching page
              this.getMatchingProjects();
              this.currentStep++;
              this.alreadyMentee = true;
              window.scrollTo(0, 0);
            }
          },
          err => {
            console.log('err', err);
            let httpCode = err.split('|')[0];
            if (httpCode == 409) {
              console.log('409 conflict detected, this means a mentee profile already exists');
              this.getMatchingProjects();
              this.currentStep = 3;
              this.eligibilityQ1Value = 'yes';
              this.eligibilityQ2Value = 'yes';
              this.eligibilityQ3Value = 'no';
              this.alreadyMentee = true;
              window.scrollTo(0, 0);
            }
            this.formSubmitted = false;
            this.submitBtnLabel = 'Submit';
          }
        );
    } else {
      this.pageSubmitted = true;
      this.formSubmitted = false;
    }
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

  getMatchingProjects() {
    const allSkills = (this.skills && this.skills.map((skill: any) => skill.name)) || [];
    const impSkills = (this.improvementSkills && this.improvementSkills.map((skill: any) => skill.name)) || [];
    impSkills.forEach(skill => {
      if (allSkills.indexOf(skill) === -1) {
        allSkills.push(skill);
      }
    });
    const projectSkills$ = allSkills.map(skill => {
      return this.getProjectsBySkill(skill);
    });

    forkJoin(...projectSkills$).subscribe(results => {
      let skillsWithProjects = [];
      for (let i = 0, max = allSkills.length; i < max; i++) {
        const projects = results[i],
          skillName = allSkills[i];
        if (projects && projects.length) {
          skillsWithProjects.push({
            name: skillName,
            header: '',
            projects: projects,
            cards: <any[]>[],
          });
        }
      }

      skillsWithProjects.sort((a, b) => {
        return -(a.projects.length - b.projects.length);
      });
      skillsWithProjects = skillsWithProjects.length <= 3 ? skillsWithProjects : skillsWithProjects.slice(0, 2);

      skillsWithProjects.forEach((skill, index) => {
        if (index === 0) {
          skill.header = `Interested in ${skill.name}?`;
        } else if (index === 1) {
          skill.header = `What about ${skill.name}?`;
        } else {
          skill.header = `${skill.name} more your thing?`;
        }
        for (const project of skill.projects) {
          const projectCard = this.convertProjectIntoProjectCard(project, project.opportunities);
          skill.cards.push(projectCard);
        }
      });

      this.allSkills = skillsWithProjects || [];
      this.skillMatchLoaded = true;
    });
  }

  toggleDemographic(control: FormControl) {
    if (control.disabled) {
      control.enable();
    } else {
      control.setValue('');
      control.disable();
    }
    // control.disabled ? control.enable() : control.disable();
  }

  private getOpportunitiesForProject(project: Project): { logoUrl: string | null }[] {
    // TODO Get opportunities data when it becomes available
    return project.opportunities || [];
  }

  private convertProjectIntoProjectCard(project: Project, opportunities: any): ProjectCard {
    const terms = project.programTerms;
    const rgbString = this.getProjectCardColor(project);
    const mentors = project.apprenticeNeeds.mentors ? project.apprenticeNeeds.mentors : [];
    return {
      projectId: project.projectId,
      subcardShown: null,
      topHeaderStyle: {
        fill: rgbString,
      },
      logoUrl: project.logoUrl,
      tags: project.industry.split(','),
      title: project.name,
      description: project.description,
      terms,
      opportunities,
      mentors,
      acceptApplications: project.acceptApplications,
      fundspringProjectId: project.fundspringProjectId,
      amountRaised: project.amountRaised || 0,
    };
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private getProjectCardColor(project: Project): string {
    if (!project.color) {
      return 'rgb(128, 128, 128)';
    }
    const { red, green, blue } = hexRgb(project.color);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  private getProjectsBySkill(skillName: string): Observable<Project[]> {
    return this.projectService.getProjectsBySkill(skillName);
  }

  eligibilityChange(event: any, question: string) {
    if (question === 'q1') {
      this.eligibilityQ1Value = event;
    } else if (question === 'q2') {
      this.eligibilityQ2Value = event;
      this.eligibilityForm.controls['eligibilityQ3'].setValue('');
    } else {
      this.eligibilityQ3Value = event;
    }
    console.log(event);
    console.log(question);
  }
}
