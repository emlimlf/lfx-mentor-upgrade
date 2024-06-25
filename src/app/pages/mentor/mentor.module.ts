// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MentorRoutingModule } from './mentor-routing.module';
import { MentorComponent } from './mentor/mentor.component';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    MentorRoutingModule,
    SharedModule
  ],
  declarations: [MentorComponent]
})
export class MentorModule { }
