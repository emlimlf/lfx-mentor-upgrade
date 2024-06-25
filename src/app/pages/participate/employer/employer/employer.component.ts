// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Employer, Invite } from '@app/models/employer.model';
import { EmployerService } from '@app/services/employer.service';
import { ProjectService } from '@app/services/project.service';
import { environment } from 'environments/environment';
import { ValidateNameNotTaken } from './employer.validators';

@Component({
  selector: 'app-employer',
  templateUrl: './employer.component.html',
  styleUrls: ['./employer.component.scss']
})
export class EmployerComponent implements OnInit {
  currentPage = 0;
  projectsList: { name: String, value: String }[];
  pageSubmitted = false;
  formSubmitted = false;
  submitBtnLabel = 'Submit';
  submissionFailed = false;
  communityBridgeUrl = environment.COMMUNITYBRIDGE_URL;
  showHiringFields = false;
  showFundingFields = false;
  nextBtnText = 'Invites';

  public form = new FormGroup({
    formPage1: new FormGroup({
      companyName: new FormControl('', Validators.required, ValidateNameNotTaken.createValidator(this.employerService)),
      logoUrl: new FormControl(''),
      description: new FormControl('', Validators.required),
      participatingHiring: new FormControl(''),
      participatingFunding: new FormControl(''),
      participatingMentoring: new FormControl(''),
    }),
    formPage2: new FormGroup({
      interviews: new FormControl(1),
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
    formPage3: new FormGroup({
      termsConditions: new FormControl('', Validators.requiredTrue),
    })
  });

  skills = [{
    tagType: 'Skill Name',
  }];

  projects = [{
    tagType: 'Project Name'
  }];

  initiatives = [{
    tagType: 'Initiative'
  }];

  initiativeList = [
    { name: 'Mentor', value: 'Mentor' },
    { name: 'Travel', value: 'Travel' },
    { name: 'Meetups', value: 'Meetups' },
    { name: 'Marketing', value: 'Marketing' },
    { name: 'Diversity', value: 'Diversity' },
    { name: 'Development', value: 'Development' },
    { name: 'Documentation', value: 'Documentation' }
  ];

  hiringProjects = [];
  fundProjects = [];
  fundInitiative = [];
  hiringSkills = [];
  employerMentors = [];
  mentors = [
    {
      'tagType': 'Name',
      'labelText': 'Name'
    },
    {
      'tagType': 'Email',
      'labelText': 'Email'
    }
  ];

  constructor(private employerService: EmployerService,
    private router: Router,
    private projectService: ProjectService) {
    this.pageSubmitted = false;
    this.projectsList = [];
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

  get termsConditions() {
    return this.formPage3.get('termsConditions') as FormControl;
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

  ngOnInit() {
    this.projectService.getProjects('', '999').subscribe(res => {
      if (res.projects && res.projects.length > 0) {
        res.projects.map(project => this.projectsList.push({ name: project.name, value: project.projectId }));
      }
    });
  }

  validate(): boolean {
    switch (this.currentPage) {
      case 0:
        return this.formPage1.valid;
      case 1:
        return this.formPage2.valid &&
          this.hiringValidation() &&
          this.fundingValidation();
      case 2:
        return this.form.valid;
      default:
        return false;
    }
  }

  hiringValidation() {
    if (this.showHiringFields) {
      return this.hiringSkills.length > 0 &&
      this.hiringProjects.length > 0;
    } else {
      return true;
    }
  }

  fundingValidation() {
    if (this.showFundingFields) {
      return this.fundProjects.length > 0 &&
        this.fundInitiative.length > 0;
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
        this.nextBtnText = 'Invites';
      }
    } else {
      this.nextBtnText = 'Participation';
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
        this.nextBtnText = 'Invites';
      }
    } else {
      this.nextBtnText = 'Participation';
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

  cancel() {
    if (confirm('You will lose your changes—are you sure you wish to cancel?')) {
      this.router.navigate(['/']);
    }
  }

  submit() {
    if (this.validate()) {
      this.pageSubmitted = true;
      this.formSubmitted = true;
      this.submitBtnLabel = 'Submitting...';
      const employer: Employer = {
        id: '',
        lfid: '',
        companyName: this.companyName.value,
        logoUrl: this.logoUrl.value,
        description: this.description.value,
        interviewOpportunities: {
          participatingHiring: this.participatingHiring.value ? true : false,
          hiringOpportunities: {
            interviews: this.interviews.value || 0,
            contact: {
              firstName: this.firstName.value,
              lastName: this.lastName.value,
              email: this.email.value,
              phone: this.phone.value
            },
            skills: this.showHiringFields ? this.hiringSkills.map((skill: any) => skill.name) : [],
            projects: this.hiringProjects.map((projects: any) => projects.value || projects.name)
          },
          participatingFunding: this.participatingFunding.value ? true : false,
          fundingOpportunities: {
            amount: this.totalFunds.value || 0,
            contact: {
              firstName: this.financialFirstName.value,
              lastName: this.financialLastName.value,
              email: this.financialEmail.value,
              phone: this.financialPhone.value
            },
            projects: this.fundProjects.map((projects: any) => projects.value),
            initiatives: this.fundInitiative.map((projects: any) => projects.value)
          },
        },
        invitations: {
          mentors: this.employerMentors.map(function (mentor: any) {
            const mentorObj: Invite = {
              name: mentor.name,
              email: mentor.email
            };
            return mentorObj;
          }),
        },
        termsAndConditions: !!this.termsConditions.value,
        status: 'pending',
      };
      this.employerService.addEmployer(employer).subscribe(
        results => {
          this.router.navigate(['/participate/employer/submitted']);
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
    }
  }
}

