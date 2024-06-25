// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployerComponent } from './employer/employer.component';
import { ApplicationSubmittedComponent } from './application-submitted/application-submitted.component';

const routes: Routes = [
  {
    path: "submitted",
    component: ApplicationSubmittedComponent
  },
  {
    path: "",
    component: EmployerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployerRoutingModule { }
