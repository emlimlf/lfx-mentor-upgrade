// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Card, CardBrand, APIError } from '../models';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { CardLoadedAction, CardLoadFailedAction, LoadCardAction } from './card.actions';
import { CardEffects } from './card.effects';
import { SubscriptionService } from '../subscription.service';

describe('CardEffects', () => {
  function makeSubscriptionService(card?: Card | APIError): SubscriptionService {
    return {
      getPaymentAccountCard: jasmine.createSpy('getPaymentAccountCard').and.returnValue(cold('a', { a: card }))
    } as any;
  }

  describe('loadCard$', () => {
    it('send a CardLoadedAction in response to a LoadCardAction and successful backend query', () => {
      const input = cold('a', { a: new LoadCardAction() });
      const card: Card = {
        brand: CardBrand.MASTERCARD,
        expiryMonth: 1,
        expiryYear: 2020,
        lastFourDigits: '1234'
      };
      const subscriptionService = makeSubscriptionService(card);
      const effects = new CardEffects(subscriptionService, new Actions(input));
      expect(effects.loadCard$).toBeObservable(cold('a', { a: new CardLoadedAction(card) }));
    });
  });

  it('send a CardLoadFailedAction in response to a LoadCardAction and failed backend query', () => {
    const input = cold('a', { a: new LoadCardAction() });
    const subscriptionService = makeSubscriptionService({ message: 'Failed' });
    const effects = new CardEffects(subscriptionService, new Actions(input));
    expect(effects.loadCard$).toBeObservable(cold('a', { a: new CardLoadFailedAction() }));
  });
});
