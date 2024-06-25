// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { createPageSelector, SUBSCRIPTIONS_FEATURE_NAME } from '.';
import { FIRST_PAGE_KEY, SubscriptionPageState } from './subscription-page.reducer';
import { LoadingStatus } from '../models';

describe('createPageSelector', () => {
  it('selects the first page when no cursor is present', () => {
    const selector = createPageSelector();
    const pageState: SubscriptionPageState = {
      [FIRST_PAGE_KEY]: {
        status: LoadingStatus.LOADING
      }
    };

    const state = {
      subscriptionPages: pageState
    } as any;
    const data = selector(state);
    expect(data).toEqual(pageState[FIRST_PAGE_KEY]);
  });

  it('selects a page when a cursor is present', () => {
    const cursor = '12345';
    const selector = createPageSelector(cursor);
    const pageState: SubscriptionPageState = {
      [cursor]: {
        status: LoadingStatus.LOADING
      }
    };

    const state = {
      subscriptionPages: pageState
    } as any;
    const data = selector(state);
    expect(data).toEqual(pageState[cursor]);
  });
});
