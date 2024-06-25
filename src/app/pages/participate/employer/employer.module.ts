// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { EmployerComponent } from './employer/employer.component';
import { EmployerRoutingModule } from './employer-routing.module';
import { ApplicationSubmittedComponent } from './application-submitted/application-submitted.component';

@NgModule({
  imports: [
    CommonModule, 
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
    EmployerRoutingModule
  ],
  declarations: [EmployerComponent, ApplicationSubmittedComponent]
})
export class EmployerModule { }
