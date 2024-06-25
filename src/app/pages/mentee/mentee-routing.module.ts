// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
import { MenteeAdminGuard } from '@app/guards/mentee-admin.guard';
import { ProfileGuard } from '@app/guards/profile.guard';
import { MenteeApplicationsComponent } from './mentee/mentee-applications/mentee-applications.component';
import { MenteePublicComponent } from './mentee/mentee-public/mentee-public.component';
import { MenteeTasksComponent } from './mentee/mentee-tasks/mentee-tasks.component';
import { MenteeComponent } from './mentee/mentee.component';

const routes: Routes = [
  {
    path: ':id',
    component: MenteeComponent,
    canActivate: [ProfileGuard],
    children: [
      {
        path: '',
        component: MenteePublicComponent,
      },
      {
        path: 'applications',
        component: MenteeApplicationsComponent,
        canActivate: [AuthGuard, MenteeAdminGuard],
        canLoad: [AuthGuard, MenteeAdminGuard],
      },
      {
        path: 'tasks',
        component: MenteeTasksComponent,
        canActivate: [AuthGuard, MenteeAdminGuard],
        canLoad: [AuthGuard, MenteeAdminGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenteeRoutingModule {}
