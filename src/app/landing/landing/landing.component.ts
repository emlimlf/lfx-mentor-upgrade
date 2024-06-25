// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { CoreState, GoAction, PROJECT_CREATE_ROUTE } from '@app/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  constructor(private store: Store<CoreState>) {}

  ngOnInit() {}

  onCreateProject() {
    this.store.dispatch(new GoAction([PROJECT_CREATE_ROUTE]));
  }
}
