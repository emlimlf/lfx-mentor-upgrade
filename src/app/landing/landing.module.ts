// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing/landing.component';

@NgModule({
  imports: [CommonModule, LandingRoutingModule, NgbModule],
  declarations: [LandingComponent]
})
export class LandingModule {}
