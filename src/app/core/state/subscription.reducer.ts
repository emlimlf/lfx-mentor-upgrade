// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { SubscriptionPageActionsUnion, SubscriptionPageActionTypes } from './subscription-page.actions';
import { SubscriptionActionTypes, SubscriptionsActionsUnion } from './subscription.actions';
import { LoadingStatus, ProjectSubscription } from '../models';

export interface SubscriptionsModel {
  status: LoadingStatus;
  subscription?: ProjectSubscription;
}

export interface SubscriptionState {
  [key: string]: SubscriptionsModel;
}

export function subscriptionsReducer(
  state: Readonly<SubscriptionState> = {},
  action: SubscriptionsActionsUnion | SubscriptionPageActionsUnion
): Readonly<SubscriptionState> {
  switch (action.type) {
    case SubscriptionActionTypes.LOAD_SUBSCRIPTION:
      return {
        ...state,
        [action.payload.projectId]: { status: LoadingStatus.LOADING }
      };

    case SubscriptionActionTypes.SUBSCRIPTION_LOADED:
      return {
        ...state,
        [action.payload.projectId]: { status: LoadingStatus.LOADED, subscription: action.payload }
      };

    case SubscriptionActionTypes.SUBSCRIPTION_LOAD_FAILED:
      return {
        ...state,
        [action.payload.projectId]: { status: LoadingStatus.LOAD_FAILED }
      };
    case SubscriptionPageActionTypes.PAGE_LOADED:
      return action.payload.page.entries
        .map(subscription => {
          return { [subscription.projectId]: { status: LoadingStatus.LOADED, subscription } };
        })
        .reduce((previous, next) => {
          return { ...previous, ...next };
        }, state);
  }

  return state;
}
