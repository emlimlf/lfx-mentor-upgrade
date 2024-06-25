// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NavigationExtras } from '@angular/router';
import { Action } from '@ngrx/store';

export enum RouterActionTypes {
  GO = '[Router] Go',
  BACK = '[Router] Back',
  FORWARD = '[Router] Forward'
}

export class GoAction implements Action {
  readonly type = RouterActionTypes.GO;
  readonly payload: { path: any[]; query?: object; extras?: NavigationExtras };

  /**
   * Navigates to a new page.
   * @param path The path using angular's Router path format, eg [ '/some-path', {'some-param': 1} ]
   */
  constructor(path: any[], query?: object, extras?: NavigationExtras) {
    this.payload = { path, query, extras };
  }
}

export class BackAction implements Action {
  readonly type = RouterActionTypes.BACK;
}

export class ForwardAction implements Action {
  readonly type = RouterActionTypes.FORWARD;
}

export type RouterActionsUnion = GoAction | BackAction | ForwardAction;
