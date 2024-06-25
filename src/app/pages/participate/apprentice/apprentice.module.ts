// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprenticeComponent } from './apprentice/apprentice.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApprenticeRoutingModule } from './apprentice-routing.module';
import { SharedModule } from '@app/shared';
import { ReactiveFormsModule } from '@angular/forms';
import { ApplicationSubmittedComponent } from './application-submitted/application-submitted.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ApprenticeRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ApprenticeComponent, ApplicationSubmittedComponent]
})
export class ApprenticeModule {}
