// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action } from '@ngrx/store';

export enum PrivateProjectsActionTypes {
  LOAD_PROJECT = '[Private Project] LOAD_PROJECTS',
  PROJECT_LOADED = '[Private Project] LOADED_PROJECTS',
  PROJECT_LOADED_FAILED = '[Private Project] LOADED_FAILED_PROJECTS'
}

export class LoadPrivateProjectsAction implements Action {
  readonly type = PrivateProjectsActionTypes.LOAD_PROJECT;
}

export class PrivateProjectLoadedAction implements Action {
  readonly type = PrivateProjectsActionTypes.PROJECT_LOADED;
  readonly payload: any;
  constructor(projects: any) {
    this.payload = projects;
  }
}

export class PrivateProjectLoadedFailedAction implements Action {
  readonly type = PrivateProjectsActionTypes.PROJECT_LOADED_FAILED;
}
export type PrivateProjectActionsUnion =
  | LoadPrivateProjectsAction
  | PrivateProjectLoadedAction
  | PrivateProjectLoadedFailedAction;
