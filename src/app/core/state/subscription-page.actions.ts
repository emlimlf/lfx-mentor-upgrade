// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action } from '@ngrx/store';
import { SubscriptionPage } from '../models';

export enum SubscriptionPageActionTypes {
  LOAD_PAGE = '[Subscriptions] LOAD_PAGE',
  PAGE_LOADED = '[Subscriptions] PAGE_LOADED',
  PAGE_LOAD_FAILED = '[Subscriptions] PAGE_LOAD_FAILED'
}

export class LoadSubscriptionPageAction implements Action {
  readonly type = SubscriptionPageActionTypes.LOAD_PAGE;
  readonly payload: { cursor?: string };
  constructor(cursor?: string) {
    this.payload = { cursor };
  }
}

export class SubscriptionPageLoadedAction implements Action {
  readonly type = SubscriptionPageActionTypes.PAGE_LOADED;
  readonly payload: { page: SubscriptionPage; cursor?: string };
  constructor(page: SubscriptionPage, cursor?: string) {
    this.payload = { page, cursor };
  }
}

export class SubscriptionPageLoadFailedAction implements Action {
  readonly type = SubscriptionPageActionTypes.PAGE_LOAD_FAILED;
  readonly payload: { cursor?: string };
  constructor(cursor?: string) {
    this.payload = { cursor };
  }
}

export type SubscriptionPageActionsUnion =
  | SubscriptionPageLoadedAction
  | SubscriptionPageLoadFailedAction
  | LoadSubscriptionPageAction;
