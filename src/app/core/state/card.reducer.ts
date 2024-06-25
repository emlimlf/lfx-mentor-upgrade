// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { CardActionsUnion, CardActionTypes } from './card.actions';
import { Card, LoadingStatus, RemoteData } from '../models';

export const getCardState = createFeatureSelector<CardModel>('card');
export const getCardSelector = createSelector(getCardState, cardState => {
  if (cardState.status === LoadingStatus.LOADED) {
    return cardState.entry;
  }
  return undefined;
});

export type CardModel = RemoteData<Card | undefined>;

export function cardReducer(state: Readonly<CardModel>, action: Action): Readonly<CardModel> {
  const cardAction = action as CardActionsUnion;
  switch (cardAction.type) {
    case CardActionTypes.LOAD_CARD:
      return { status: LoadingStatus.LOADING };
    case CardActionTypes.CARD_LOADED:
      return { status: LoadingStatus.LOADED, entry: cardAction.payload };
    case CardActionTypes.CARD_LOAD_FAILED:
      return { status: LoadingStatus.LOAD_FAILED };
  }
  return state;
}
