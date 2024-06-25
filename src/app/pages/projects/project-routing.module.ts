// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectAppliedComponent } from './project-applied/project-applied.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { AuthGuard } from '@app/guards/auth.guard';
import { ProjectOwnerGuard } from '@app/guards/project-owner.guard';
import { ProjectPublicComponent } from '@app/pages/projects/project-detail/project-public/project-public.component';
import { ProjectMenteesComponent } from '@app/pages/projects/project-detail/project-mentees/project-mentees.component';
import { HiddenStatusGuard } from '@app/guards/hidden-status.guard';

const routes: Routes = [
  {
    path: 'applied',
    component: ProjectAppliedComponent,
  },
  {
    path: ':id/edit',
    component: ProjectEditComponent,
    canActivate: [AuthGuard, ProjectOwnerGuard, HiddenStatusGuard],
  },
  {
    path: ':id',
    component: ProjectDetailComponent,
    canActivate: [HiddenStatusGuard],
    children: [
      {
        path: '',
        component: ProjectPublicComponent,
      },
      {
        path: 'mentees',
        component: ProjectMenteesComponent,
      },
      {
        path: 'mentees-past',
        component: ProjectMenteesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
