// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskFilterComponent } from './task-filter/task-filter.component';
import { TaskGroupComponent } from './task-group/task-group.component';
import { TaskComponent } from './task/task.component';
import { TasksComponent } from './tasks/tasks.component';
import { FormatDatePipe } from '../format-date.pipe';
import { LoaderComponent } from '../loader/loader.component';
import { ClickOutsideDirective } from '../directives/click-outisde.directive';
import { PreventDoubleClickDirective } from '../directives/prevent-doubleclicks.directive';

@NgModule({
  imports: [ReactiveFormsModule, NgbModule, FormsModule, CommonModule],
  declarations: [
    TaskComponent,
    TaskFilterComponent,
    TaskGroupComponent,
    TasksComponent,
    FormatDatePipe,
    LoaderComponent,
    ClickOutsideDirective,
    PreventDoubleClickDirective,
  ],
  exports: [TasksComponent, FormatDatePipe, LoaderComponent, ClickOutsideDirective, PreventDoubleClickDirective],
})
export class TasksModule {}
