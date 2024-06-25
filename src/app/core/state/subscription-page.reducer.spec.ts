// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { GoAction } from '.';
import {
  LoadSubscriptionPageAction,
  SubscriptionPageLoadedAction,
  SubscriptionPageLoadFailedAction
} from './subscription-page.actions';
import {
  FIRST_PAGE_KEY,
  subscriptionPageReducer,
  SubscriptionPageState,
  SubscriptionsPageModel
} from './subscription-page.reducer';
import { LoadingStatus, ProjectSubscription, SubscriptionPage } from '../models';

describe('subscriptionPageReducer', () => {
  const cursorKey = '12345';
  const defaultNextCursor = '6789';
  const defaultPreviousCursor = '6789';

  const projectId = '678910';

  function makeSubscription(id: string = projectId): ProjectSubscription {
    return {
      projectId: id,
      amountInCents: 100,
      createdOn: new Date(),
      name: 'Dogchain',
      industry: 'Blockchain',
      description: 'Blockchain for dogs by dogs',
      color: 'CCCCCC',
      logoUrl: 'http://logoUrl'
    };
  }

  function makePageModel(
    projectIds: string[],
    nextCursor: string | undefined = defaultNextCursor,
    previousCursor: string | undefined = defaultPreviousCursor
  ): SubscriptionsPageModel {
    return {
      currentProjectIds: projectIds,
      nextCursor,
      previousCursor
    };
  }

  function makePage(
    ids: string[],
    nextCursor: string | undefined = defaultNextCursor,
    previousCursor: string | undefined = defaultPreviousCursor
  ): SubscriptionPage {
    return {
      entries: ids.map(id => makeSubscription(id)),
      link: {
        nextCursor,
        previousCursor
      }
    };
  }

  it('clears the state for a page when it receives a LOAD_PAGE action', () => {
    const entry = makePageModel(['1', '2', '3']);
    const state: SubscriptionPageState = { [cursorKey]: { status: LoadingStatus.LOADED, entry } };
    const output = subscriptionPageReducer(state, new LoadSubscriptionPageAction(cursorKey));
    expect(output).toEqual({ [cursorKey]: { status: LoadingStatus.LOADING } });
  });

  it('updates the state for a page when it receives a PAGE_LOADED action', () => {
    const page = makePage(['1', '2', '3']);
    const state: SubscriptionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const output = subscriptionPageReducer(state, new SubscriptionPageLoadedAction(page, cursorKey));
    const expected: SubscriptionPageState = {
      [cursorKey]: { status: LoadingStatus.LOADED, entry: makePageModel(['1', '2', '3']) }
    };
    expect(output).toEqual(expected);
  });

  it('updates the state for a starting page when it receives a PAGE_LOADED action', () => {
    const page = makePage(['1', '2', '3']);
    const state: SubscriptionPageState = { [FIRST_PAGE_KEY]: { status: LoadingStatus.LOADING } };
    const output = subscriptionPageReducer(state, new SubscriptionPageLoadedAction(page));
    const expected: SubscriptionPageState = {
      [FIRST_PAGE_KEY]: { status: LoadingStatus.LOADED, entry: makePageModel(['1', '2', '3']) }
    };
    expect(output).toEqual(expected);
  });

  it('updates the state for a page when it receives a PAGE_LOAD_FAILED action', () => {
    const state: SubscriptionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const output = subscriptionPageReducer(state, new SubscriptionPageLoadFailedAction(cursorKey));
    const expected: SubscriptionPageState = { [cursorKey]: { status: LoadingStatus.LOAD_FAILED } };
    expect(output).toEqual(expected);
  });

  it('ignores other actions ', () => {
    const state: SubscriptionPageState = { [cursorKey]: { status: LoadingStatus.LOADING } };
    const action = new GoAction(['/']) as any;
    const output: SubscriptionPageState = subscriptionPageReducer(state, action);
    expect(output).toEqual(state);
  });
});
