// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CoreState } from './core-state';
import { FIRST_PAGE_KEY } from './subscription-page.reducer';
import { TransactionPageModel } from './transactions.page.reducer';
import { LoadingStatus, RemoteData } from '../models';

export const TRANSACTIONS_FEATURE_NAME = 'transactions';

export function createTransactionsSelector(backerId: string) {
  return (coreState: CoreState) => coreState.backers[backerId];
}

function getTransactionsRemoteData(state: CoreState, cursor?: string): RemoteData<TransactionPageModel> {
  if (state === undefined) {
    return { status: LoadingStatus.LOAD_FAILED };
  }
  const key = cursor !== undefined ? cursor : FIRST_PAGE_KEY;
  const output = state.backersPage[key];
  if (output === undefined) {
    return { status: LoadingStatus.LOAD_FAILED };
  }
  return output as RemoteData<TransactionPageModel>;
}

export function createTransactionsPageSelector(cursor?: string) {
  return (coreState: CoreState) => getTransactionsRemoteData(coreState, cursor);
}
