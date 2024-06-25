// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { cold } from 'jasmine-marbles';
import { Observable } from 'rxjs';
import { LoginAction, LogoutAction, Token, TriggerLoginAction, TriggerLoginRefreshAction } from './auth.actions';
import { AuthEffects } from './auth.effects';
import { GoAction } from './router.actions';
import { AuthCallbackResult, AuthService, TOKEN_STORAGE_KEY } from '../auth.service';

describe('AuthEffects', () => {
  let authService: AuthService;
  let storage: Storage;
  let token: Token;
  let path: any[];

  function createAuthService(
    refreshLoginResponse: Observable<Token>,
    authCallback: Observable<AuthCallbackResult>,
    parseToken: Token
  ): AuthService {
    return {
      authenticateWithTargetRoute: jasmine.createSpy('authenticateWithTargetRoute'),
      readAndVerifyTokenFromBrowserURL: jasmine
        .createSpy('readAndVerifyTokenFromBrowserURL')
        .and.returnValue(authCallback),
      refreshAuthToken: jasmine.createSpy('refreshAuthToken').and.returnValue(refreshLoginResponse),
      notifyBackendOfLogin: jasmine.createSpy('notifyBackendOfLogin'),
      parseToken: parseToken
    } as any;
  }

  beforeEach(() => {
    // Create the mock
    token = {
      accessToken: 'accessToken',
      idToken: 'idToken',
      expiresAt: new Date()
    };
    path = ['/path'];
    const authCallback: AuthCallbackResult = {
      token,
      redirectPath: path
    };
    const authResponse = cold('a|', { a: authCallback });
    const refreshLoginResponse = cold('a|', { a: token });
    const parseToken = token;
    authService = createAuthService(refreshLoginResponse, authResponse, parseToken);
    storage = {
      setItem: jasmine.createSpy('setItem'),
      getItem: jasmine.createSpy('getItem').and.returnValue(JSON.stringify(token)),
      removeItem: jasmine.createSpy('removeItem')
    } as any;
  });

  describe('reloadTokenOnInit$', () => {
    it('triggers a LoginAction if a token is present in storage', () => {
      const zone = TestBed.get(NgZone);
      const initAction = cold('a', { a: { type: ROOT_EFFECTS_INIT } });
      const authEffects = new AuthEffects(authService, storage, new Actions(initAction), zone);
      const output = cold('(a|)', { a: new LoginAction(token) });
      expect(authEffects.reloadTokenOnInit$).toBeObservable(output);
    });
    it("doesn't trigger a LoginAction if no token was present in storage", () => {
      const zone = TestBed.get(NgZone);
      storage = {
        ...storage,
        getItem: jasmine.createSpy('getItem').and.returnValue(null)
      } as any;
      const initAction = cold('a', { a: { type: ROOT_EFFECTS_INIT } });
      const authEffects = new AuthEffects(authService, storage, new Actions(initAction), zone);
      const output = cold('-');
      expect(authEffects.reloadTokenOnInit$).toBeObservable(output);
    });
  });

  describe('saveTokenOnLogin$', () => {
    it('saves token to storage on LoginAction', () => {
      const zone = TestBed.get(NgZone);
      const input = cold('(a|)', { a: new LoginAction(token) });
      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);
      expect(authEffects.saveTokenOnLogin$).toBeObservable(input);
      expect(storage.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, JSON.stringify(token));
    });
  });

  describe('removeTokenOnLogout$', () => {
    it('removes the token from storage when given a LOGOUT_ACTION and redirects to landing', () => {
      const zone = TestBed.get(NgZone);
      const logoutAction = new LogoutAction();
      const input = cold('(a|)', { a: logoutAction });

      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);
      expect(authEffects.removeTokenOnLogout$).toBeObservable(input);
      expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    });
  });

  describe('redirectToLandingPageOnLogout$', () => {
    it('redirects to landing when a LogoutAction is sent', () => {
      const zone = TestBed.get(NgZone);

      const logoutAction = new LogoutAction();
      const input = cold('(a|)', { a: logoutAction });

      const goAction = new GoAction(['/']);
      const output = cold('(a|)', { a: goAction });

      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);
      expect(authEffects.redirectToLandingPageOnLogout$).toBeObservable(output);
    });
  });

  describe('triggerLoginRedirect$', () => {
    it('calls authorize when given a TRIGGER_LOGIN action', () => {
      const zone = TestBed.get(NgZone);

      const action = new TriggerLoginAction(['/']);
      const input = cold('a|', { a: action });
      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);

      // Passes without modification
      expect(authEffects.triggerLoginRedirect$).toBeObservable(input);
      expect(authService.authenticateWithTargetRoute).toHaveBeenCalled();
    });
  });

  describe('refreshToken$', () => {
    it('creates a LoginAction when given a TRIGGER_REFRESH_LOGIN action', () => {
      const zone = TestBed.get(NgZone);

      const triggerLoginAction = new TriggerLoginRefreshAction();
      const input = cold('a|', { a: triggerLoginAction });
      const loginAction = new LoginAction(token);
      const output = cold('a|', { a: loginAction });
      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);

      // Passes without modification
      expect(authEffects.refreshToken$).toBeObservable(output);
      expect(authService.refreshAuthToken).toHaveBeenCalled();
    });
  });

  describe('completeLoginRedirectFromAuthRoute$', () => {
    it('sends a LoginAction and GoAction when the /auth path is loaded', () => {
      const zone = TestBed.get(NgZone);

      const navigationAction = {
        type: ROUTER_NAVIGATION,
        payload: {
          routerState: {
            url: '/auth#FAKE_DATE'
          }
        }
      };
      const input = cold('(a)-|', { a: navigationAction });

      const loginAction = new LoginAction(token);
      const goAction = new GoAction(path, undefined, { replaceUrl: true });
      const output = cold('(ab)|', { a: loginAction, b: goAction });

      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);
      expect(authEffects.completeLoginRedirectFromAuthRoute$).toBeObservable(output);
    });
    it('sends a GoAction to the landing page when auth service returns an error', () => {
      const zone = TestBed.get(NgZone);

      const navigationAction = {
        type: ROUTER_NAVIGATION,
        payload: {
          routerState: {
            url: '/auth#FAKE_DATE'
          }
        }
      };
      const input = cold('(a)-|', { a: navigationAction });
      const errorResponse = cold('#');

      const goAction = new GoAction(['/'], undefined, { replaceUrl: true });
      const output = cold('(a|)', { a: goAction });

      authService = createAuthService(errorResponse, errorResponse, token);
      const authEffects = new AuthEffects(authService, storage, new Actions(input), zone);
      expect(authEffects.completeLoginRedirectFromAuthRoute$).toBeObservable(output);
    });
  });
});
