// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MentorComponent } from './mentor/mentor.component';
import { SubmittedApplicationComponent } from './application-submitted/submitted-application.component';
import { MentorJoinComponent } from './mentor-join/mentor-join.component';
import { MentorDeclineComponent } from './mentor-decline/mentor-decline.component';

const routes: Routes = [
  {
    path: '',
    component: MentorComponent,
  },
  {
    path: 'submitted',
    component: SubmittedApplicationComponent,
  },
  {
    path: 'submitted/:projectId',
    component: SubmittedApplicationComponent,
  },
  {
    path: ':id',
    component: MentorComponent,
  },
  {
    path: 'join/:projectId',
    component: MentorJoinComponent,
  },
  {
    path: 'decline/:projectId',
    component: MentorDeclineComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorRoutingModule {}
