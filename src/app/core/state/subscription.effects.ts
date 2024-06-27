// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import {
  LoadSubscriptionPageAction,
  SubscriptionPageActionTypes,
  SubscriptionPageLoadedAction,
  SubscriptionPageLoadFailedAction,
} from './subscription-page.actions';
import {
  SubscriptionActionTypes,
  SubscriptionLoadAction,
  SubscriptionLoadedAction,
  SubscriptionLoadFailedAction,
} from './subscription.actions';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class SubscriptionsEffects {
  requestOnLoadPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<LoadSubscriptionPageAction>(SubscriptionPageActionTypes.LOAD_PAGE),
      mergeMap(action => this.requestPageWithCursor(action.payload.cursor))
    );
  });

  requestOnLoadSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<SubscriptionLoadAction>(SubscriptionActionTypes.LOAD_SUBSCRIPTION),
      mergeMap(action => this.requestSubscription(action.payload.projectId))
    );
  });

  constructor(private actions$: Actions, private subscriptionService: SubscriptionService) {}

  private requestPageWithCursor(
    cursor?: string
  ): Observable<SubscriptionPageLoadedAction | SubscriptionPageLoadFailedAction> {
    return this.subscriptionService.getPage(cursor).pipe(
      map(page => new SubscriptionPageLoadedAction(page, cursor)),
      catchError(_ => of(new SubscriptionPageLoadFailedAction(cursor)))
    );
  }

  private requestSubscription(projectId: string): Observable<SubscriptionLoadedAction | SubscriptionLoadFailedAction> {
    return this.subscriptionService.getSubscription(projectId).pipe(
      map(sub => new SubscriptionLoadedAction(sub)),
      catchError(_ => of(new SubscriptionLoadFailedAction(projectId)))
    );
  }
}
