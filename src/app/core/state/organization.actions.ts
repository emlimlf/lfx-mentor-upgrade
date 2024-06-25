// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action } from '@ngrx/store';
import { Organization } from '../models';

export enum OrganizationActionTypes {
  LOAD_USER_ORGANIZATIONS = '[Organization] LOAD_USER_ORGANIZATIONS',
  USER_ORGANIZATIONS_LOADED = '[Organization] USER_ORGANIZATIONS_LOADED',
  USER_ORGANIZATIONS_LOADED_FAILED = '[Organization] USER_ORGANIZATIONS_LOADED_FAILED'
}

export class LoadUserOrganizationsAction implements Action {
  readonly type = OrganizationActionTypes.LOAD_USER_ORGANIZATIONS;
}

export class UserOrganizationsLoadedAction implements Action {
  readonly type = OrganizationActionTypes.USER_ORGANIZATIONS_LOADED;
  constructor(public payload: Organization[]) {}
}

export class UserOrganizationsLoadedFailedAction implements Action {
  readonly type = OrganizationActionTypes.USER_ORGANIZATIONS_LOADED_FAILED;
}
export type OrganizationActionsUnion =
  | LoadUserOrganizationsAction
  | UserOrganizationsLoadedAction
  | UserOrganizationsLoadedFailedAction;
