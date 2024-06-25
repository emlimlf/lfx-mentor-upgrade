// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TransactionPageActionsUnion, TransactionPageActionTypes } from './transactions.page.actions';
import { LoadingStatus, Transaction } from '../models';

export interface TransactionsModel {
  status: LoadingStatus;
  transaction?: Transaction;
}

export interface TransactionsState {
  [key: string]: TransactionsModel;
}

export function transactionsReducer(
  state: Readonly<TransactionsState> = {},
  action: TransactionPageActionsUnion
): Readonly<TransactionsState> {
  switch (action.type) {
    case TransactionPageActionTypes.PAGE_LOADED:
      const entries = action.payload.page.entries
        .map(transaction => {
          return { [transaction.id]: { status: LoadingStatus.LOADED, transaction } };
        })
        .reduce((previous, next) => {
          return { ...previous, ...next };
        }, {});
      return {
        ...state,
        ...entries
      };
  }

  return state;
}
