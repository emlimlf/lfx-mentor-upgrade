// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TransactionPageLoadedAction } from './transactions.page.actions';
import { transactionsReducer } from './transactions.reducer';
import { LoadingStatus, Transaction, TransactionPage, TransactionType } from '../models';

describe('transactionsReducer', () => {
  function makeTransaction(name: string, id: string): Transaction {
    return {
      name,
      type: TransactionType.DONATION,
      id,
      avatarUrl: 'https://avatarurl',
      amountInCents: 2000,
      createdOn: new Date(0),
      organization: {
        name: '',
        id: '',
        avatarUrl: ''
      }
    };
  }
  it('updates the state of transactions in a page when it receives a PAGE_LOADED action', () => {
    const newName1 = 'abc';
    const newName2 = 'def';
    const newName3 = 'ghi';
    const id1 = '1234';
    const id2 = '5678';
    const id3 = '91011';

    jasmine.clock().mockDate(new Date());

    const state = {};
    const page: TransactionPage = {
      entries: [makeTransaction(newName1, id1), makeTransaction(newName2, id2), makeTransaction(newName3, id3)],
      link: {}
    };
    const output = transactionsReducer(state, new TransactionPageLoadedAction(page));
    expect(output).toEqual({
      [id1.toString()]: { status: LoadingStatus.LOADED, transaction: makeTransaction(newName1, id1) },
      [id2.toString()]: { status: LoadingStatus.LOADED, transaction: makeTransaction(newName2, id2) },
      [id3.toString()]: { status: LoadingStatus.LOADED, transaction: makeTransaction(newName3, id3) }
    });
  });
});
