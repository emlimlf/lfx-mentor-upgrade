// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  SubscriptionLoadAction,
  SubscriptionLoadedAction,
  SubscriptionLoadFailedAction,
  subscriptionsReducer
} from '.';
import { LoadingStatus, ProjectSubscription, SubscriptionPage } from '@app/core';
import { SubscriptionPageLoadedAction } from './subscription-page.actions';

describe('subscriptionsReducer', () => {
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

  it('clears the state for a subscription when it receives a LOAD_SUBSCRIPTION action', () => {
    const subscription = makeSubscription();
    const state = { [projectId]: { status: LoadingStatus.LOADED, subscription } };
    const output = subscriptionsReducer(state, new SubscriptionLoadAction(projectId));
    expect(output).toEqual({ [projectId]: { status: LoadingStatus.LOADING } });
  });

  it('updates the state for a subscription when it receives a SUBSCRIPTION_LOADED action', () => {
    const state = { [projectId]: { status: LoadingStatus.LOADING } };
    const subscription = makeSubscription();

    const output = subscriptionsReducer(state, new SubscriptionLoadedAction(subscription));
    expect(output).toEqual({ [projectId]: { status: LoadingStatus.LOADED, subscription } });
  });

  it('updates the state for a subscription when it receives a SUBSCRIPTION_LOAD_FAILED action', () => {
    const state = { [projectId]: { status: LoadingStatus.LOADING } };
    const output = subscriptionsReducer(state, new SubscriptionLoadFailedAction(projectId));
    expect(output).toEqual({ [projectId]: { status: LoadingStatus.LOAD_FAILED } });
  });

  it('updates the state of each subscription in a page when it receives a PAGE_LOADED action', () => {
    const newProjectId1 = '678910';
    const newProjectId2 = '111213';
    const newProjectId3 = '141516';

    jasmine.clock().mockDate(new Date());

    const state = {};
    const page: SubscriptionPage = {
      entries: [makeSubscription(newProjectId1), makeSubscription(newProjectId2), makeSubscription(newProjectId3)],
      link: {}
    };
    const output = subscriptionsReducer(state, new SubscriptionPageLoadedAction(page));
    expect(output).toEqual({
      [newProjectId1]: { status: LoadingStatus.LOADED, subscription: makeSubscription(newProjectId1) },
      [newProjectId2]: { status: LoadingStatus.LOADED, subscription: makeSubscription(newProjectId2) },
      [newProjectId3]: { status: LoadingStatus.LOADED, subscription: makeSubscription(newProjectId3) }
    });
  });

  it('ignores other actions', () => {
    const state = {};
    const output = subscriptionsReducer(state, { type: 'AnotherType' } as any);
    expect(output).toEqual(state);
  });
});
