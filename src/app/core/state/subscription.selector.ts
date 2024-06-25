// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CoreState } from './core-state';
import { FIRST_PAGE_KEY } from './subscription-page.reducer';
import { SubscriptionsPageModel } from './subscription-page.reducer';
import { LoadingStatus, RemoteData } from '../models';

export const SUBSCRIPTIONS_FEATURE_NAME = 'subscriptions';
export function createSubscriptionSelector(projectId: string) {
  return (coreState: CoreState) => coreState.subscriptions[projectId];
}

function getRemoteData(state: CoreState, cursor?: string): RemoteData<SubscriptionsPageModel> {
  if (state === undefined) {
    return { status: LoadingStatus.LOAD_FAILED };
  }
  const key = cursor !== undefined ? cursor : FIRST_PAGE_KEY;
  const output = state.subscriptionPages[key];
  if (output === undefined) {
    return { status: LoadingStatus.LOAD_FAILED };
  }
  return output as RemoteData<SubscriptionsPageModel>;
}

export function createPageSelector(cursor?: string) {
  return (coreState: CoreState) => getRemoteData(coreState, cursor);
}
