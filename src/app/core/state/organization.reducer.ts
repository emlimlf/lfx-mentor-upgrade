// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { LoadingStatus, Organization, RemoteData } from '@app/core/models';
import { Action, createFeatureSelector } from '@ngrx/store';
import { OrganizationActionsUnion, OrganizationActionTypes } from './organization.actions';

export const organizationSelector = createFeatureSelector<OrganizationModel>('organization');

export type OrganizationModel = RemoteData<Organization[]>;

export function organizationReducer(
  state: Readonly<OrganizationModel> = { status: LoadingStatus.LOADING },
  action: Action
): Readonly<OrganizationModel> {
  const organizationAction = action as OrganizationActionsUnion;
  switch (organizationAction.type) {
    case OrganizationActionTypes.LOAD_USER_ORGANIZATIONS:
      return { status: LoadingStatus.LOADING };
    case OrganizationActionTypes.USER_ORGANIZATIONS_LOADED:
      return { status: LoadingStatus.LOADED, entry: organizationAction.payload };
    case OrganizationActionTypes.USER_ORGANIZATIONS_LOADED_FAILED:
      return { status: LoadingStatus.LOAD_FAILED };
  }
  return state;
}
