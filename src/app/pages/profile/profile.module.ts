// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@app/shared';
import { EmployerService } from '@app/services/employer.service';
import { RedirectingModule } from '@app/redirecting/redirecting.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { EmployerProfileEditComponent } from './profile-edit/employer/employer-profile-edit.component';
import { MentorProfileEditComponent } from './profile-edit/mentor/mentor-profile-edit.component';
import { MenteeProfileEditComponent } from './profile-edit/mentee/mentee-profile-edit.component';

@NgModule({
  imports: [CommonModule, NgbModule, ProfileRoutingModule, ReactiveFormsModule, SharedModule, RedirectingModule],
  declarations: [
    MenteeProfileEditComponent,
    EmployerProfileEditComponent,
    MentorProfileEditComponent,
    ProfileEditComponent,
  ],
  providers: [EmployerService],
})
export class ProfileModule {}
