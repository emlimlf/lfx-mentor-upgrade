// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { PROJECT_CREATE_ROUTE, GoAction } from 'app/core';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-signup-callout',
  templateUrl: './signup-callout.component.html',
  styleUrls: ['./signup-callout.component.scss']
})
export class SignupCalloutComponent implements OnInit {
  constructor(private store: Store<any>) {}

  ngOnInit() {}

  onApply() {
    this.store.dispatch(new GoAction([PROJECT_CREATE_ROUTE]));
  }
}
