// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { EmployerService } from '@app/services/employer.service';
import { ProjectService } from '@app/services/project.service';
import { Employer, Invite } from '@app/models/employer.model';
import { ValidateEditNameNotTaken } from '@app/pages/profile/profile-edit/employer/employer-profile-edit.validators';

const REDIRECT_DELAY = 750;

@Component({
  selector: 'app-profile-edit-employer',
  styleUrls: ['./employer-profile-edit.component.scss'],
  templateUrl: './employer-profile-edit.component.html',
})
export class EmployerProfileEditComponent implements OnInit {
  // Observables.
  previewUrl$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  projectsList: { name: String; value: String }[];
  currentPage = 0;
  pageSubmitted = false;
  formSubmitted = false;
  submitBtnLabel = 'Submit';
  submissionFailed = false;
  showHiringFields = false;
  showFundingFields = false;
  logoUrlValue: string;
  profileLoaded = false;
  nextBtnText = 'Next: Invites';

  form: FormGroup = new FormGroup({});

  skills = [
    {
      tagType: 'Skill Name',
    },
  ];

  projects = [
    {
      tagType: 'Project Name',
    },
  ];

  initiatives = [
    {
      tagType: 'Initiative',
    },
  ];

  initiativeList = [
    { name: 'Mentor', value: 'Mentor' },
    { name: 'Travel', value: 'Travel' },
    { name: 'Meetups', value: 'Meetups' },
    { name: 'Marketing', value: 'Marketing' },
    { name: 'Diversity', value: 'Diversity' },
    { name: 'Development', value: 'Development' },
    { name: 'Documentation', value: 'Documentation' },
  ];

  hiringProjects: any[];
  fundProjects: any[];
  fundInitiative: any[];
  hiringSkills: any[];
  employerMentors: any[];

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

  private employerId = '';
  private lfid = '';
  private status = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private employerService: EmployerService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.hiringProjects = [];
    this.fundProjects = [];
    this.fundInitiative = [];
    this.hiringSkills = [];
    this.employerMentors = [];

    this.logoUrlValue = '';
    this.projectsList = [];
  }

  ngOnInit() {
    this.createForm();
    this.setProjetsList().then(() => {
      this.activatedRoute.queryParams.subscribe(routeParams => {
        this.employerService.getEmployer(routeParams.id).subscribe(employerResponse => {
          this.employerId = employerResponse.id;
          this.lfid = employerResponse.lfid;
          this.status = employerResponse.status;
          this.createForm(employerResponse.companyName);
          this.prePopulateForm(employerResponse);
          this.profileLoaded = true;
          if (this.participatingHiring.value) {
            this.toggleHiringFields();
          }
          if (this.participatingFunding.value) {
            this.toggleFundingFields();
          }
        });
      });
    });
  }

  createForm(companyName?: string) {
    this.form = new FormGroup({
      formPage1: new FormGroup({
        companyName: new FormControl(
          '',
          Validators.required,
          ValidateEditNameNotTaken.createValidator(this.employerService, companyName)
        ),
        logoUrl: new FormControl(''),
        description: new FormControl('', Validators.required),
        participatingHiring: new FormControl(''),
        participatingFunding: new FormControl(''),
        participatingMentoring: new FormControl(''),
      }),
      formPage2: new FormGroup({
        interviews: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl('', [Validators.email]),
        phone: new FormControl(''),
        totalFunds: new FormControl(''),
        financialFirstName: new FormControl(''),
        financialLastName: new FormControl(''),
        financialEmail: new FormControl('', [Validators.email]),
        financialPhone: new FormControl(''),
      }),
      formPage3: new FormGroup({}),
    });
  }
  get formPage1() {
    return this.form.get('formPage1') as FormGroup;
  }

  get formPage2() {
    return this.form.get('formPage2') as FormGroup;
  }

  get formPage3() {
    return this.form.get('formPage3') as FormGroup;
  }

  get companyName(): FormControl {
    return this.formPage1.get('companyName') as FormControl;
  }

  get logoUrl(): FormControl {
    return this.formPage1.get('logoUrl') as FormControl;
  }

  get description(): FormControl {
    return this.formPage1.get('description') as FormControl;
  }

  get participatingHiring(): FormControl {
    return this.formPage1.get('participatingHiring') as FormControl;
  }

  get participatingFunding(): FormControl {
    return this.formPage1.get('participatingFunding') as FormControl;
  }

  get participatingMentoring(): FormControl {
    return this.formPage1.get('participatingMentoring') as FormControl;
  }

  get firstName(): FormControl {
    return this.formPage2.get('firstName') as FormControl;
  }

  get lastName(): FormControl {
    return this.formPage2.get('lastName') as FormControl;
  }

  get email(): FormControl {
    return this.formPage2.get('email') as FormControl;
  }

  get phone(): FormControl {
    return this.formPage2.get('phone') as FormControl;
  }

  get interviews() {
    return this.formPage2.get('interviews') as FormControl;
  }

  get totalFunds() {
    return this.formPage2.get('totalFunds') as FormControl;
  }

  get financialFirstName() {
    return this.formPage2.get('financialFirstName') as FormControl;
  }

  get financialLastName() {
    return this.formPage2.get('financialLastName') as FormControl;
  }

  get financialEmail() {
    return this.formPage2.get('financialEmail') as FormControl;
  }

  get financialPhone() {
    return this.formPage2.get('financialPhone') as FormControl;
  }

  validate(): boolean {
    switch (this.currentPage) {
      case 0:
        return this.formPage1.valid;
      case 1:
        return this.formPage2.valid && this.hiringValidation() && this.fundingValidation();
      case 2:
        return this.form.valid;
      default:
        return false;
    }
  }

  hiringValidation() {
    if (this.showHiringFields) {
      return this.hiringSkills.length > 0 && this.hiringProjects.length > 0;
    } else {
      return true;
    }
  }

  fundingValidation() {
    if (this.showFundingFields) {
      return this.fundProjects.length > 0 && this.fundInitiative.length > 0;
    } else {
      return true;
    }
  }

  toggleHiringFields() {
    if (this.showHiringFields) {
      this.showHiringFields = false;
      this.interviews.disable();
      this.interviews.setValue('');
      this.firstName.disable();
      this.firstName.setValue('');
      this.lastName.disable();
      this.lastName.setValue('');
      this.email.disable();
      this.email.setValue('');
      this.phone.disable();
      this.phone.setValue('');
      if (!this.showFundingFields && !this.showHiringFields) {
        this.nextBtnText = 'Next: Invites';
      }
    } else {
      this.nextBtnText = 'Next: Participation';
      this.showHiringFields = true;
      this.interviews.enable();
      this.firstName.enable();
      this.lastName.enable();
      this.email.enable();
      this.phone.enable();
    }
  }

  toggleFundingFields() {
    if (this.showFundingFields) {
      this.showFundingFields = false;
      this.totalFunds.disable();
      this.totalFunds.setValue('');
      this.financialFirstName.disable();
      this.financialFirstName.setValue('');
      this.financialLastName.disable();
      this.financialLastName.setValue('');
      this.financialEmail.disable();
      this.financialEmail.setValue('');
      this.financialPhone.disable();
      this.financialPhone.setValue('');
      if (!this.showFundingFields && !this.showHiringFields) {
        this.nextBtnText = 'Next: Invites';
      }
    } else {
      this.nextBtnText = 'Next: Participation';
      this.showFundingFields = true;
      this.totalFunds.enable();
      this.financialFirstName.enable();
      this.financialLastName.enable();
      this.financialEmail.enable();
      this.financialPhone.enable();
    }
  }

  back() {
    if (this.currentPage === 2 && (this.showFundingFields || this.showHiringFields)) {
      this.currentPage--;
    } else {
      this.currentPage = 0;
    }
    window.scrollTo(0, 0);
  }

  next() {
    if (this.validate()) {
      this.pageSubmitted = false;
      if (this.currentPage === 0 && (this.showFundingFields || this.showHiringFields)) {
        this.currentPage++;
      } else {
        this.currentPage = 2;
      }
      window.scrollTo(0, 0);
    } else {
      this.pageSubmitted = true;
    }
  }

  onCancel() {
    if (confirm('You will lose your changes - are you sure you wish to cancel?')) {
      this.router.navigate(['/'], { fragment: 'my-account' });
    }
  }

  private setProjetsList() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.projectService.getProjects('', '999').subscribe(res => {
          if (res.projects && res.projects.length > 0) {
            res.projects.map(project => this.projectsList.push({ name: project.name, value: project.projectId }));
            resolve(true);
          }
        });
      });
    });
  }

  submit() {
    if (this.validate()) {
      this.pageSubmitted = true;
      this.formSubmitted = true;
      this.submitBtnLabel = 'Submitting...';

      if (!this.logoUrl.value) {
        this.logoUrl.setValue('');
      }

      const employer: Employer = {
        id: this.employerId,
        lfid: this.lfid,
        companyName: this.companyName.value.trim(),
        logoUrl: this.logoUrl.value,
        description: this.description.value,
        interviewOpportunities: {
          participatingHiring: this.participatingHiring.value,
          hiringOpportunities: {
            interviews: this.interviews.value || 0,
            contact: {
              firstName: this.firstName.value,
              lastName: this.lastName.value,
              email: this.email.value,
              phone: this.phone.value,
            },
            skills: this.showHiringFields ? this.hiringSkills.map((skill: any) => skill.name) : [],
            projects: this.hiringProjects.map((projects: any) => projects.value),
          },
          participatingFunding: this.participatingFunding.value,
          fundingOpportunities: {
            amount: this.totalFunds.value || 0,
            contact: {
              firstName: this.financialFirstName.value,
              lastName: this.financialLastName.value,
              email: this.financialEmail.value,
              phone: this.financialPhone.value,
            },
            projects: this.fundProjects.map((projects: any) => projects.value),
            initiatives: this.fundInitiative.map((initiative: any) => initiative.name),
          },
        },
        invitations: {
          mentors: this.employerMentors.map(function(mentor: any) {
            const mentorObj: Invite = {
              name: mentor.name,
              email: mentor.email,
            };
            return mentorObj;
          }),
        },
        termsAndConditions: true,
        status: this.status,
      };
      this.employerService.updateEmployerProfile(employer).subscribe(
        results => this.onSuccess(),
        error => {
          console.log(error);
          this.pageSubmitted = true;
          this.formSubmitted = false;
          this.submitBtnLabel = 'Submit';
          this.submissionFailed = true;
        }
      );
    } else {
      this.pageSubmitted = true;
    }
  }

  onSuccess(redirectDelay = REDIRECT_DELAY) {
    this.submitBtnLabel = 'Saved';

    setTimeout(() => {
      this.router.navigate(['/'], { fragment: 'my-account' });
    }, redirectDelay);
  }

  private prePopulateForm(employer: Employer) {
    const interviewOpportunities = employer.interviewOpportunities;
    const invitations = employer.invitations;

    this.companyName.patchValue(employer.companyName);
    this.logoUrl.patchValue(employer.logoUrl);
    this.description.patchValue(employer.description);
    this.participatingHiring.patchValue(interviewOpportunities.participatingHiring ? true : false);
    this.participatingFunding.patchValue(interviewOpportunities.participatingFunding ? true : false);
    this.logoUrlValue = employer.logoUrl as string;
    if (interviewOpportunities.participatingHiring && interviewOpportunities.hiringOpportunities) {
      const hiringOpportunities = interviewOpportunities.hiringOpportunities;

      this.interviews.patchValue(hiringOpportunities.interviews);
      this.firstName.patchValue(hiringOpportunities.contact.firstName);
      this.lastName.patchValue(hiringOpportunities.contact.lastName);
      this.email.patchValue(hiringOpportunities.contact.email);
      this.phone.patchValue(hiringOpportunities.contact.phone);

      if (hiringOpportunities.skills) {
        hiringOpportunities.skills.forEach(skill => {
          this.hiringSkills.push({ name: skill });
        });
      }

      if (hiringOpportunities.projects) {
        setTimeout(() => {
          const hiringProjects = hiringOpportunities.projects;
          const currentHiringProjects = this.projectsList.filter(f => hiringProjects.includes(f.value as string));
          currentHiringProjects.forEach(project => {
            this.hiringProjects.push(project);
          });
        });
      }
    }
    if (interviewOpportunities.participatingFunding && interviewOpportunities.fundingOpportunities) {
      const fundingOpportunities = interviewOpportunities.fundingOpportunities;

      this.totalFunds.patchValue(fundingOpportunities.amount);
      this.financialFirstName.patchValue(fundingOpportunities.contact.firstName);
      this.financialLastName.patchValue(fundingOpportunities.contact.lastName);
      this.financialEmail.patchValue(fundingOpportunities.contact.email);
      this.financialPhone.patchValue(fundingOpportunities.contact.phone);

      if (fundingOpportunities.projects) {
        setTimeout(() => {
          const fundingProjects = fundingOpportunities.projects;
          const currentFundingProjects = this.projectsList.filter(f => fundingProjects.includes(f.value as string));
          currentFundingProjects.forEach(project => {
            this.fundProjects.push(project);
          });
        });
      }

      if (fundingOpportunities.initiatives) {
        fundingOpportunities.initiatives.forEach(initiative => {
          this.fundInitiative.push({ name: initiative });
        });
      }
    }
    if (invitations) {
      if (invitations.mentors) {
        invitations.mentors.forEach(mentor => {
          this.employerMentors.push({
            name: mentor.name,
            email: mentor.email,
          });
        });
      }
    }
  }
}
