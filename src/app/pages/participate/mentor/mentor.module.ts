// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorComponent } from './mentor/mentor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MentorRoutingModule } from './mentor-routing.module';
import { SharedModule } from '@app/shared';
import { ReactiveFormsModule } from '@angular/forms';
import { SubmittedApplicationComponent } from './application-submitted/submitted-application.component';
import { MentorJoinComponent } from './mentor-join/mentor-join.component';
import { MentorDeclineComponent } from './mentor-decline/mentor-decline.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    MentorRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [MentorComponent, SubmittedApplicationComponent, MentorJoinComponent, MentorDeclineComponent]
})
export class MentorModule {}
