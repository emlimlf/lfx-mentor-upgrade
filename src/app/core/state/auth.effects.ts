// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
// import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
// import { AlertType } from '@app/core/models/index';
// import { Actions, Effect, ofType } from '@ngrx/effects';
// import { Action } from '@ngrx/store';
// import { asyncScheduler, interval, NEVER, Observable, of } from 'rxjs';
// import { catchError, delay, mergeMap, map, observeOn, switchMap, tap } from 'rxjs/operators';
// import * as uuidv4 from 'uuid/v4';
// import { QueueAlertAction } from './alerts.actions';
// import { AuthActionTypes, LoginAction, Token, TriggerLoginAction, TriggerLoginRefreshAction } from './auth.actions';
// import { GoAction } from './router.actions';
// import { AuthService, TOKEN_STORAGE_KEY } from '../auth.service';
// import { AUTH_ROUTE } from '../constants';
// import { isNavigationActionToRoute, onStoreInitialized } from '../utilities/observables';
// import { enterZone, leaveZone } from '../utilities/zone';

// export const STORAGE_TOKEN = new InjectionToken<Storage>('storage');

// export const REQUEST_ID_KEY = 'requestId';

// export const TIME_BEFORE_EXPIRED = 60 * 1000;

// function serializeToken(token: Token): string {
//   return JSON.stringify(token);
// }

// function saveTokenToStorage(token: Token, storage: Storage) {
//   storage.setItem(TOKEN_STORAGE_KEY, serializeToken(token));
// }

// function removeTokenFromStorage(storage: Storage) {
//   storage.removeItem(TOKEN_STORAGE_KEY);
// }

// function saveRequestIdToStorage(requestId: string, storage: Storage) {
//   storage.setItem(REQUEST_ID_KEY, requestId);
// }

// export function loadRequestIdFromStorage(storage: Storage): string {
//   const requestId = storage.getItem(REQUEST_ID_KEY);
//   if (requestId === null) {
//     throw Error('RequestId missing from storage');
//   }
//   return requestId;
// }

// function parseToken(token: string): Token {
//   const tokenObj = JSON.parse(token);
//   return {
//     accessToken: tokenObj.accessToken,
//     idToken: tokenObj.idToken,
//     expiresAt: new Date(tokenObj.expiresAt)
//   };
// }

// function removeRequestIdFromStorage(storage: Storage) {
//   storage.removeItem(REQUEST_ID_KEY);
// }

// function generateRequestId(): string {
//   return uuidv4();
// }

// @Injectable()
// export class AuthEffects {
//   @Effect()
//   reloadTokenOnInit$: Observable<LoginAction> = onStoreInitialized(this.actions$).pipe(
//     mergeMap(() => {
//       const token = this.loadTokenFromStorage(this.storage);
//       if (token !== undefined) {
//         return of(new LoginAction(token));
//       }
//       return NEVER;
//     })
//   );

//   @Effect({ dispatch: false })
//   saveTokenOnLogin$ = this.actions$.pipe(
//     ofType(AuthActionTypes.LOGIN),
//     tap(action => {
//       const loginAction = action as LoginAction;
//       const token = loginAction.payload;
//       saveTokenToStorage(token, this.storage);
//       this.authService.notifyBackendOfLogin();
//     })
//   );

//   @Effect()
//   silentRefreshCurrentPage$ = this.actions$.pipe(
//     ofType(AuthActionTypes.LOGIN),

//     switchMap(action => {
//       const loginAction = action as LoginAction;
//       const token = loginAction.payload;
//       if (token !== undefined) {
//         const timeUntilExpiry = token.expiresAt.getTime() - new Date().getTime();
//         if (timeUntilExpiry > TIME_BEFORE_EXPIRED) {
//           return of(new TriggerLoginRefreshAction()).pipe(
//             delay(timeUntilExpiry, leaveZone(this.ngZone, asyncScheduler)),
//             observeOn(enterZone(this.ngZone, asyncScheduler))
//           ); // Delay to 1 minute before the expiry time
//         }
//       }
//       return NEVER;
//     })
//   );

//   @Effect({ dispatch: false })
//   triggerLoginRedirect$ = this.actions$.pipe(
//     ofType(AuthActionTypes.TRIGGER_LOGIN),
//     tap(action => {
//       const loginAction = action as TriggerLoginAction;

//       const redirectPath = loginAction.payload.redirectPath;
//       const requestId = generateRequestId();
//       saveRequestIdToStorage(requestId, this.storage);

//       this.authService.authenticateWithTargetRoute(requestId, redirectPath);
//     })
//   );

//   @Effect()
//   refreshToken$ = this.actions$.pipe(
//     ofType(AuthActionTypes.TRIGGER_LOGIN_REFRESH),
//     mergeMap(action => {
//       const requestId = generateRequestId();
//       return this.authService.refreshAuthToken(requestId);
//     }),
//     map(token => new LoginAction(token)),
//     catchError(_ =>
//       of(
//         new QueueAlertAction({
//           alertText: 'You are about to be logged out. You may ',
//           alertType: AlertType.INFO,
//           alertLink: { text: 'login again.', path: '/' }
//         })
//       )
//     )
//   );

//   @Effect({ dispatch: false })
//   removeTokenOnLogout$ = this.actions$.pipe(
//     ofType(AuthActionTypes.LOGOUT),
//     tap(action => removeTokenFromStorage(this.storage))
//   );

//   @Effect()
//   redirectToLandingPageOnLogout$ = this.actions$.pipe(
//     ofType(AuthActionTypes.LOGOUT),
//     map((action: Action) => new GoAction(['/']))
//   );

//   @Effect()
//   completeLoginRedirectFromAuthRoute$ = this.actions$.pipe(
//     isNavigationActionToRoute(AUTH_ROUTE),
//     mergeMap(action => {
//       const requestId = loadRequestIdFromStorage(this.storage);
//       removeRequestIdFromStorage(this.storage);
//       return this.authService.readAndVerifyTokenFromBrowserURL(requestId);
//     }),
//     mergeMap(authCallbackResult =>
//       of<Action>(
//         new LoginAction(authCallbackResult.token),
//         new GoAction(authCallbackResult.redirectPath, undefined, { replaceUrl: true })
//       )
//     ),
//     catchError(error => of(new GoAction(['/'], undefined, { replaceUrl: true })))
//   );

//   constructor(
//     private authService: AuthService,
//     @Inject(STORAGE_TOKEN) private storage: Storage,
//     private actions$: Actions,
//     private ngZone: NgZone
//   ) {}

//   private loadTokenFromStorage(storage: Storage): Token | undefined {
//     const tokenString = storage.getItem(TOKEN_STORAGE_KEY);
//     if (tokenString === null) {
//       return undefined;
//     }
//     return parseToken(tokenString);
//   }
// }
