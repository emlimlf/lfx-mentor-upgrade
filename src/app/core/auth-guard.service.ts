// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CoreState, TriggerLoginAction } from './state';

@Injectable()
export class AuthGuardService /*implements CanActivate*/ {
  constructor(private store: Store<CoreState>) {}

  // private readonly isLoggedIn$ = this.store.select(getLoggedInState);

  // canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return this.isLoggedIn$.pipe(
    //   tap(isLoggedIn => {
    //     if (!isLoggedIn) {
    //       this.triggerLogin(state);
    //     }
    //   })
    // );
  // }

  // private triggerLogin(state: RouterStateSnapshot) {
  //   const url = [state.url];
  //   this.store.dispatch(new TriggerLoginAction(url));
  // }
}
