// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { GoAction } from './router.actions';
import { CardLoadedAction, CardLoadFailedAction, LoadCardAction } from './card.actions';
import { CardModel, cardReducer } from './card.reducer';
import { CardBrand, LoadingStatus } from '../models';

describe('cardReducer', () => {
  it('clears the card from the state when it starts loading', () => {
    const state: CardModel = {
      status: LoadingStatus.LOADED,
      entry: { brand: CardBrand.MASTERCARD, lastFourDigits: '1234', expiryMonth: 12, expiryYear: 20 }
    };
    const output = cardReducer(state, new LoadCardAction());
    expect(output).toEqual({ status: LoadingStatus.LOADING });
  });

  it('adds the card to the state after a succesful reload', () => {
    const state: CardModel = { status: LoadingStatus.LOADING };
    const card = { brand: CardBrand.MASTERCARD, lastFourDigits: '1234', expiryMonth: 12, expiryYear: 20 };
    const output = cardReducer(state, new CardLoadedAction(card));
    expect(output).toEqual({ status: LoadingStatus.LOADED, entry: card });
  });

  it('sets the LOAD_FAILED state on error', () => {
    const state: CardModel = { status: LoadingStatus.LOADING };
    const output = cardReducer(state, new CardLoadFailedAction());
    expect(output).toEqual({ status: LoadingStatus.LOAD_FAILED });
  });

  it('leaves the state intact for any other action', () => {
    const card = { brand: CardBrand.MASTERCARD, lastFourDigits: '1234', expiryMonth: 12, expiryYear: 20 };
    const state: CardModel = { status: LoadingStatus.LOADED, entry: card };
    const output = cardReducer(state, new GoAction([]));
    expect(output).toEqual({ status: LoadingStatus.LOADED, entry: card });
  });
});
