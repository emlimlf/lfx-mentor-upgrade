// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenteeRoutingModule } from './mentee-routing.module';
import { MenteeApplicationsComponent } from './mentee/mentee-applications/mentee-applications.component';
import { MenteePublicComponent } from './mentee/mentee-public/mentee-public.component';
import { MenteeTasksComponent } from './mentee/mentee-tasks/mentee-tasks.component';
import { MenteeComponent } from './mentee/mentee.component';


@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    MenteeRoutingModule
  ],
  declarations: [MenteeComponent, MenteePublicComponent, MenteeApplicationsComponent, MenteeTasksComponent]
})
export class MenteeModule { }
