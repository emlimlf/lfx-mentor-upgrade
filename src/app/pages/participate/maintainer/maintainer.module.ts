// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { MaintainerRoutingModule } from './maintainer-routing.module';
import { MaintainerComponent } from './maintainer/maintainer.component';
import { ApplicationSubmittedComponent } from './application-submitted/application-submitted.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    MaintainerRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [MaintainerComponent, ApplicationSubmittedComponent]
})
export class MaintainerModule { }
