// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { GoAction, RouterActionTypes } from './router.actions';

@Injectable()
export class RouterEffects {
  @Effect({ dispatch: false })
  /**
   * Changes the router location when a GoAction is sent.
   */
  navigate$ = this.actions$.pipe(
    ofType(RouterActionTypes.GO),
    tap((action: Action) => {
      const goAction = action as GoAction;
      const extras = { queryParams: goAction.payload.query, ...goAction.payload.extras };
      this.router.navigate(goAction.payload.path, extras);
    })
  );

  @Effect({ dispatch: false })
  navigateBack$ = this.actions$.pipe(ofType(RouterActionTypes.BACK), tap(() => this.location.back()));

  @Effect({ dispatch: false })
  navigateForward$ = this.actions$.pipe(ofType(RouterActionTypes.FORWARD), tap(() => this.location.forward()));

  constructor(private actions$: Actions, private router: Router, private location: Location) {}
}
