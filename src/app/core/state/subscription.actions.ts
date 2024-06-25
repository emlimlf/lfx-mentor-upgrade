// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ProjectSubscription } from '@app/core';
import { Action } from '@ngrx/store';

export enum SubscriptionActionTypes {
  LOAD_SUBSCRIPTION = '[Subscriptions] LOAD_SUBSCRIPTION',
  SUBSCRIPTION_LOADED = '[Subscriptions] SUBSCRIPTION_LOADED',
  SUBSCRIPTION_LOAD_FAILED = '[Subscriptions] SUBSCRIPTION_LOAD_FAILED'
}

export class SubscriptionLoadAction implements Action {
  readonly type = SubscriptionActionTypes.LOAD_SUBSCRIPTION;
  readonly payload: { projectId: string };
  constructor(projectId: string) {
    this.payload = { projectId };
  }
}

export class SubscriptionLoadedAction implements Action {
  readonly type = SubscriptionActionTypes.SUBSCRIPTION_LOADED;
  constructor(public payload: ProjectSubscription) {}
}

export class SubscriptionLoadFailedAction implements Action {
  readonly type = SubscriptionActionTypes.SUBSCRIPTION_LOAD_FAILED;
  readonly payload: { projectId: string };
  constructor(projectId: string) {
    this.payload = { projectId };
  }
}

export type SubscriptionsActionsUnion =
  | SubscriptionLoadAction
  | SubscriptionLoadedAction
  | SubscriptionLoadFailedAction;
