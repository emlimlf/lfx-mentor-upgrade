// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprenticeComponent } from './apprentice/apprentice.component';
import { ApplicationSubmittedComponent } from './application-submitted/application-submitted.component';

const routes: Routes = [
  {
    path: "matching",
    component: ApplicationSubmittedComponent
  },
  {
    path: "",
    component: ApprenticeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprenticeRoutingModule { }
