// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { LoadSubscriptionPageAction, SubscriptionPageLoadedAction, SubscriptionPageLoadFailedAction } from '.';
import { ProjectSubscription, SubscriptionPage, SubscriptionService } from '@app/core';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { SubscriptionLoadAction, SubscriptionLoadedAction, SubscriptionLoadFailedAction } from './subscription.actions';
import { SubscriptionsEffects } from './subscription.effects';

function makeSubscriptionService(
  page?: SubscriptionPage,
  secondPage?: SubscriptionPage,
  singleSubscription?: ProjectSubscription
): SubscriptionService {
  const getPageReturnValue = page === undefined ? cold('#') : cold('a|', { a: page });
  const getSecondPageReturnValue = page === undefined ? cold('#') : cold('a|', { a: secondPage });
  const getSinglePageReturnValue = singleSubscription === undefined ? cold('#') : cold('a|', { a: singleSubscription });
  return {
    getPage: jasmine.createSpy('getPage').and.returnValues(getPageReturnValue, getSecondPageReturnValue),
    getSubscription: jasmine.createSpy('getSubscription').and.returnValue(getSinglePageReturnValue)
  } as any;
}

describe('SubscriptionsEffects', () => {
  const projectId = '12345';
  const subscription: ProjectSubscription = {
    projectId: projectId,
    amountInCents: 100,
    createdOn: new Date(),
    name: 'Dogchain',
    industry: 'Blockchain',
    description: 'Blockchain for dogs by dogs',
    color: 'CCCCCC',
    logoUrl: 'http://logoUrl'
  };

  describe('requestOnLoadPage$', () => {
    it('returns a SubscriptionPageLoadedAction on successful backend call', () => {
      const loadAction = new LoadSubscriptionPageAction();
      const page: SubscriptionPage = {
        entries: [subscription],
        link: {}
      };
      const subscriptionService = makeSubscriptionService(page);
      const actions = cold('a|', { a: loadAction });
      const effects = new SubscriptionsEffects(new Actions(actions), subscriptionService);

      const expected = cold('a|', { a: new SubscriptionPageLoadedAction(page) });
      expect(effects.requestOnLoadPage$).toBeObservable(expected);
    });
    it('returns a SubscriptionPageLoadFailedAction on failed backend call', () => {
      const loadAction = new LoadSubscriptionPageAction();
      const subscriptionService = makeSubscriptionService();
      const actions = cold('(a|)', { a: loadAction });
      const effects = new SubscriptionsEffects(new Actions(actions), subscriptionService);

      const expected = cold('(a|)', { a: new SubscriptionPageLoadFailedAction() });
      expect(effects.requestOnLoadPage$).toBeObservable(expected);
    });
  });

  describe('requestOnLoadSubscription$', () => {
    it('returns a SubscriptionLoadedAction on successful backend call', () => {
      const loadAction = new SubscriptionLoadAction(projectId);
      const sub: ProjectSubscription = {
        projectId,
        createdOn: new Date(),
        amountInCents: 1234,
        industry: 'Some Industry',
        name: 'Some Name',
        color: 'CCCCCC',
        description: 'Some Description',
        logoUrl: 'http://logoUrl'
      };
      const subscriptionService = makeSubscriptionService(undefined, undefined, sub);
      const actions = cold('a|', { a: loadAction });
      const effects = new SubscriptionsEffects(new Actions(actions), subscriptionService);

      const expected = cold('a|', { a: new SubscriptionLoadedAction(sub) });
      expect(effects.requestOnLoadSubscription$).toBeObservable(expected);
    });
    it('returns a SubscriptionLoadFailedAction on failed backend call', () => {
      const loadAction = new SubscriptionLoadAction(projectId);
      const subscriptionService = makeSubscriptionService();
      const actions = cold('(a|)', { a: loadAction });
      const effects = new SubscriptionsEffects(new Actions(actions), subscriptionService);

      const expected = cold('(a|)', { a: new SubscriptionLoadFailedAction(projectId) });
      expect(effects.requestOnLoadSubscription$).toBeObservable(expected);
    });
  });
});
