// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TransactionPage } from '@app/core';
import { Action } from '@ngrx/store';

export enum TransactionPageActionTypes {
  LOAD_PAGE = '[Transactions] LOAD_PAGE',
  LOAD_MY_PAGE = '[Transactions] LOAD_MY_PAGE',
  PAGE_LOADED = '[Transactions] PAGE_LOADED',
  PAGE_LOAD_FAILED = '[Transactions] PAGE_LOAD_FAILED'
}
export class LoadTransactionPageAction implements Action {
  readonly type = TransactionPageActionTypes.LOAD_PAGE;
  readonly payload: { projectId: string; cursor?: string };
  constructor(projectId: string, cursor?: string) {
    this.payload = { projectId, cursor };
  }
}
export class TransactionPageLoadedAction implements Action {
  readonly type = TransactionPageActionTypes.PAGE_LOADED;
  readonly payload: { page: TransactionPage; cursor?: string };
  constructor(page: TransactionPage, cursor?: string) {
    this.payload = { page, cursor };
  }
}

export class TransactionPageLoadFailedAction implements Action {
  readonly type = TransactionPageActionTypes.PAGE_LOAD_FAILED;
  readonly payload: { cursor?: string };
  constructor(cursor?: string) {
    this.payload = { cursor };
  }
}

export class LoadMyTransactionPageAction implements Action {
  readonly type = TransactionPageActionTypes.LOAD_MY_PAGE;
  readonly payload: { cursor?: string };
  constructor(cursor?: string) {
    this.payload = { cursor };
  }
}
export type TransactionPageActionsUnion =
  | TransactionPageLoadedAction
  | TransactionPageLoadFailedAction
  | LoadTransactionPageAction
  | LoadMyTransactionPageAction;
