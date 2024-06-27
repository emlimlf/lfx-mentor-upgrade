// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { CardActionTypes, CardLoadedAction, CardLoadFailedAction } from './card.actions';
import { isAPIError } from '../models';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class CardEffects {
  loadCard$: Observable<CardLoadedAction | CardLoadFailedAction> = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardActionTypes.LOAD_CARD),
      mergeMap(() => this.subscriptionService.getPaymentAccountCard()),
      map(card => {
        if (isAPIError(card)) {
          return new CardLoadFailedAction();
        }
        return new CardLoadedAction(card);
      })
    );
  });
  constructor(private subscriptionService: SubscriptionService, private actions$: Actions) {}
}
