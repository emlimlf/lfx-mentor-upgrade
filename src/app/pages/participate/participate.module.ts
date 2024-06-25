// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ParticipateRoutingModule } from './participate-routing.module';
import { ParticipateComponent } from './participate/participate.component';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ParticipateRoutingModule,
    SharedModule,
  ],
  declarations: [ParticipateComponent]
})
export class ParticipateModule { }
