// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { CardActionTypes, CardLoadedAction, CardLoadFailedAction } from './card.actions';
import { isAPIError } from '../models';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class CardEffects {
  @Effect()
  loadCard$: Observable<CardLoadedAction | CardLoadFailedAction> = this.actions$.pipe(
    ofType(CardActionTypes.LOAD_CARD),
    flatMap(() => this.subscriptionService.getPaymentAccountCard()),
    map(card => {
      if (isAPIError(card)) {
        return new CardLoadFailedAction();
      }
      return new CardLoadedAction(card);
    })
  );
  constructor(private subscriptionService: SubscriptionService, private actions$: Actions) {}
}
