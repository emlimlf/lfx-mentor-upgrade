// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { GoAction } from './router.actions';
import { FIRST_PAGE_KEY } from './subscription-page.reducer';
import {
  LoadTransactionPageAction,
  TransactionPageLoadedAction,
  TransactionPageLoadFailedAction
} from './transactions.page.actions';
import { transactionPageReducer } from './transactions.page.reducer';
import { TransactionPageModel, TransactionPageState } from './transactions.page.reducer';
import { LoadingStatus, Transaction, TransactionPage, TransactionType } from '../models';

describe('transactionsPageReducer', () => {
  const cursorKey = '12345';
  const defaultNextCursor = '6789';
  const defaultPreviousCursor = '6789';

  const projectId = '678910';
  const id1 = '1234';
  const id2 = '5678';
  const id3 = '91011';

  function makeTransaction(id: string): Transaction {
    return {
      name: 'abcd',
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

  function makePageModel(
    backerIds: string[],
    nextCursor: string | undefined = defaultNextCursor,
    previousCursor: string | undefined = defaultPreviousCursor
  ): TransactionPageModel {
    return {
      firstIndex: 0,
      currentTransactionIds: backerIds,
      nextCursor,
      previousCursor
    };
  }

  function makePage(
    ids: string[],
    nextCursor: string | undefined = defaultNextCursor,
    previousCursor: string | undefined = defaultPreviousCursor
  ): TransactionPage {
    return {
      entries: ids.map(id => makeTransaction(id)),
      link: {
        nextCursor,
        previousCursor
      }
    };
  }
  it('clears the state for a page when it receives a LOAD_PAGE action', () => {
    const entry = makePageModel(['1', '2', '3']);
    const state: TransactionPageState = { [cursorKey]: { status: LoadingStatus.LOADED, entry } };
    const output = transactionPageReducer(state, new LoadTransactionPageAction(projectId, cursorKey));
    expect(output).toEqual({ [cursorKey]: { status: LoadingStatus.LOADING } });
  });

  it('updates the state for a page when it receives a PAGE_LOADED action', () => {
    const page = makePage([id1, id2, id3]);
    const state: TransactionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const output = transactionPageReducer(state, new TransactionPageLoadedAction(page, cursorKey));
    const expected: TransactionPageState = {
      [cursorKey]: {
        status: LoadingStatus.LOADED,
        entry: makePageModel([id1.toString(), id2.toString(), id3.toString()])
      }
    };
    expect(output).toEqual(expected);
  });

  it('updates the state for a starting page when it receives a PAGE_LOADED action', () => {
    const page = makePage([id1, id2, id3]);
    const state: TransactionPageState = { [FIRST_PAGE_KEY]: { status: LoadingStatus.LOADING } };
    const output = transactionPageReducer(state, new TransactionPageLoadedAction(page));
    const expected: TransactionPageState = {
      [FIRST_PAGE_KEY]: {
        status: LoadingStatus.LOADED,
        entry: makePageModel([id1.toString(), id2.toString(), id3.toString()])
      }
    };
    expect(output).toEqual(expected);
  });

  it('updates the state for a page when it receives a PAGE_LOAD_FAILED action', () => {
    const state: TransactionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const output = transactionPageReducer(state, new TransactionPageLoadFailedAction(cursorKey));
    const expected: TransactionPageState = { [cursorKey]: { status: LoadingStatus.LOAD_FAILED } };
    expect(output).toEqual(expected);
  });

  it('ignores other actions ', () => {
    const state: TransactionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const action = new GoAction(['/']) as any;
    const output: TransactionPageState = transactionPageReducer(state, action);
    expect(output).toEqual(state);
  });
});
