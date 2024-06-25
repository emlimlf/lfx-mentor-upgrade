// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedModule } from '@app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectAppliedComponent } from './project-applied/project-applied.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ProjectPublicComponent } from './project-detail/project-public/project-public.component';
import { ProjectMenteesComponent } from './project-detail/project-mentees/project-mentees.component';
import { MenteesTabComponent } from './project-detail/mentees-tab/mentees-tab.component';
import { MenteesTabTasksComponent } from './project-detail/mentees-tab-tasks/mentees-tab-tasks.component';
import { MenteesTabRowComponent } from './project-detail/mentees-tab-row/mentees-tab-row.component';
import { MenteesTabTasksRowComponent } from './project-detail/mentees-tab-tasks-row/mentees-tab-tasks-row.component';
import { MenteesTabAddTasksComponent } from './project-detail/mentees-tab-add-tasks/mentees-tab-add-tasks.component';
import { CustomDatePipe } from '@app/shared/custom-date.pipe';
import { MenteesTabTasksRowEditComponent } from './project-detail/mentees-tab-tasks-row-edit/mentees-tab-tasks-row-edit.component';

@NgModule({
  imports: [CommonModule, NgbModule, ProjectRoutingModule, ReactiveFormsModule, FormsModule, SharedModule],
  entryComponents: [MenteesTabAddTasksComponent, MenteesTabTasksRowEditComponent],
  exports: [CustomDatePipe],
  declarations: [
    ProjectDetailComponent,
    ProjectAppliedComponent,
    ProjectEditComponent,
    ProjectPublicComponent,
    ProjectMenteesComponent,
    CustomDatePipe,
    MenteesTabComponent,
    MenteesTabRowComponent,
    MenteesTabTasksComponent,
    MenteesTabTasksRowComponent,
    MenteesTabAddTasksComponent,
    MenteesTabTasksRowEditComponent,
  ],
})
export class ProjectModule {}
