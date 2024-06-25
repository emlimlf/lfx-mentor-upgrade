// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action } from '@ngrx/store';
import { Card } from '../models';

export enum CardActionTypes {
  LOAD_CARD = '[Card] LOAD_CARD',
  CARD_LOADED = '[Card] CARD_LOADED',
  CARD_LOAD_FAILED = '[Card] CARD_LOAD_FAILED'
}

export class LoadCardAction implements Action {
  readonly type = CardActionTypes.LOAD_CARD;
}

export class CardLoadedAction implements Action {
  readonly type = CardActionTypes.CARD_LOADED;
  constructor(public readonly payload: Card | undefined) {}
}

export class CardLoadFailedAction implements Action {
  readonly type = CardActionTypes.CARD_LOAD_FAILED;
}

export type CardActionsUnion = LoadCardAction | CardLoadedAction | CardLoadFailedAction;
