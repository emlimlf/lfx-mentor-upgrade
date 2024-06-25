// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { FIRST_PAGE_KEY } from './subscription-page.reducer';
import { TransactionPageActionsUnion, TransactionPageActionTypes } from './transactions.page.actions';
import { LoadingStatus, RemoteData, TransactionPage } from '../models';

export interface TransactionPageModel {
  currentTransactionIds: string[];
  firstIndex: number;
  nextCursor?: string;
  previousCursor?: string;
}
export interface TransactionPageState {
  [key: string]: RemoteData<TransactionPageModel>;
}

function getCursorKey(action: TransactionPageActionsUnion) {
  const { cursor } = action.payload;
  return cursor === undefined ? FIRST_PAGE_KEY : cursor;
}

function getTransactionIdList(page: TransactionPage) {
  return page.entries.map(transaction => transaction.id);
}

function getTransactionPageModel(page: TransactionPage) {
  const firstIndex = page.firstIndex !== undefined ? page.firstIndex : 0;
  const transactionPage = {
    firstIndex,
    currentTransactionIds: getTransactionIdList(page),
    nextCursor: page.link.nextCursor,
    previousCursor: page.link.previousCursor
  };
  return transactionPage;
}

export function transactionPageReducer(
  state: Readonly<TransactionPageState> = {},
  action: TransactionPageActionsUnion
): Readonly<TransactionPageState> {
  const transactionAction = action as TransactionPageActionsUnion;

  switch (transactionAction.type) {
    case TransactionPageActionTypes.LOAD_PAGE:
      return {
        ...state,
        [getCursorKey(transactionAction)]: { status: LoadingStatus.LOADING }
      };
    case TransactionPageActionTypes.LOAD_MY_PAGE:
      return {
        ...state,
        [getCursorKey(transactionAction)]: { status: LoadingStatus.LOADING }
      };

    case TransactionPageActionTypes.PAGE_LOAD_FAILED:
      return {
        ...state,
        [getCursorKey(transactionAction)]: { status: LoadingStatus.LOAD_FAILED }
      };

    case TransactionPageActionTypes.PAGE_LOADED:
      return {
        ...state,
        [getCursorKey(transactionAction)]: {
          status: LoadingStatus.LOADED,
          entry: getTransactionPageModel(transactionAction.payload.page)
        }
      };
  }
  return state;
}
