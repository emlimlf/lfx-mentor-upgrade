// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParticipateComponent } from './participate/participate.component';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ParticipateComponent
  },
  {
    path: 'mentor',
    loadChildren: './mentor/mentor.module#MentorModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'mentee',
    loadChildren: './apprentice/apprentice.module#ApprenticeModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'employer',
    loadChildren: './employer/employer.module#EmployerModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'maintainer',
    loadChildren: './maintainer/maintainer.module#MaintainerModule',
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParticipateRoutingModule { }
