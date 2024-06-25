// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { createTransactionsPageSelector } from '.';
import { FIRST_PAGE_KEY } from './subscription-page.reducer';
import { TransactionPageState } from './transactions.page.reducer';
import { LoadingStatus } from '../models';

describe('createTransactionsPageSelector', () => {
  it('selects the first page when no cursor is present', () => {
    const selector = createTransactionsPageSelector();
    const pageState: TransactionPageState = {
      [FIRST_PAGE_KEY]: {
        status: LoadingStatus.LOADING
      }
    };

    const state = {
      backersPage: pageState
    } as any;
    const data = selector(state);
    expect(data).toEqual(pageState[FIRST_PAGE_KEY]);
  });

  it('selects a page when a cursor is present', () => {
    const cursor = '12345';
    const selector = createTransactionsPageSelector(cursor);
    const pageState: TransactionPageState = {
      [cursor]: {
        status: LoadingStatus.LOADING
      }
    };

    const state = {
      backersPage: pageState
    } as any;
    const data = selector(state);
    expect(data).toEqual(pageState[cursor]);
  });
});
