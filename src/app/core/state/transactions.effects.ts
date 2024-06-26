// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import {
  LoadTransactionPageAction,
  TransactionPageActionTypes,
  TransactionPageLoadedAction,
  TransactionPageLoadFailedAction,
  LoadMyTransactionPageAction,
} from './transactions.page.actions';
import { TransactionsService } from '../transactions.service';

@Injectable()
export class TransactionEffects {
  @Effect()
  requestOnLoadTransactionPage$ = this.actions$.pipe(
    ofType<LoadTransactionPageAction>(TransactionPageActionTypes.LOAD_PAGE),
    mergeMap(action => this.requestTransactionPageWithCursor(action.payload.projectId, action.payload.cursor))
  );

  @Effect()
  requestOnLoadMyTransactionPage$ = this.actions$.pipe(
    ofType<LoadMyTransactionPageAction>(TransactionPageActionTypes.LOAD_MY_PAGE),
    mergeMap(action => this.requestMyTransactionPageWithCursor(action.payload.cursor))
  );

  constructor(private transactionService: TransactionsService, private actions$: Actions) {}

  private requestTransactionPageWithCursor(projectId: string, cursor?: string) {
    return this.transactionService.getPage(projectId, cursor).pipe(
      map(page => new TransactionPageLoadedAction(page, cursor)),
      catchError(err => of(new TransactionPageLoadFailedAction(cursor)))
    );
  }
  private requestMyTransactionPageWithCursor(cursor?: string) {
    return this.transactionService.getMyPage(cursor).pipe(
      map(page => new TransactionPageLoadedAction(page, cursor)),
      catchError(err => of(new TransactionPageLoadFailedAction(cursor)))
    );
  }
}
