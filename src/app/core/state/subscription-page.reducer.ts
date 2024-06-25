// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { SubscriptionPageActionsUnion, SubscriptionPageActionTypes } from './subscription-page.actions';
import { LoadingStatus, RemoteData, SubscriptionPage } from '../models';

export const FIRST_PAGE_KEY = 'first';

export interface SubscriptionsPageModel {
  currentProjectIds: string[];
  nextCursor?: string;
  previousCursor?: string;
}

export interface SubscriptionPageState {
  [key: string]: RemoteData<SubscriptionsPageModel>;
}

function getProjectIdList(page: SubscriptionPage) {
  return page.entries.map(subscription => subscription.projectId);
}

function getPageModel(page: SubscriptionPage) {
  return {
    currentProjectIds: getProjectIdList(page),
    nextCursor: page.link.nextCursor,
    previousCursor: page.link.previousCursor
  };
}

function getCursorKey(action: SubscriptionPageActionsUnion) {
  const { cursor } = action.payload;
  return cursor === undefined ? FIRST_PAGE_KEY : cursor;
}

export function subscriptionPageReducer(
  state: Readonly<SubscriptionPageState> = {},
  action: SubscriptionPageActionsUnion
): Readonly<SubscriptionPageState> {
  const pageAction = action as SubscriptionPageActionsUnion;

  switch (pageAction.type) {
    case SubscriptionPageActionTypes.LOAD_PAGE:
      return {
        ...state,
        [getCursorKey(pageAction)]: { status: LoadingStatus.LOADING }
      };

    case SubscriptionPageActionTypes.PAGE_LOAD_FAILED:
      return {
        ...state,
        [getCursorKey(pageAction)]: { status: LoadingStatus.LOAD_FAILED }
      };

    case SubscriptionPageActionTypes.PAGE_LOADED:
      return {
        ...state,
        [getCursorKey(pageAction)]: { status: LoadingStatus.LOADED, entry: getPageModel(pageAction.payload.page) }
      };
  }
  return state;
}
