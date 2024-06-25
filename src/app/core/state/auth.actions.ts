// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { UserInfo } from '@app/core';
import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  TRIGGER_LOGIN = '[Auth] TRIGGER_LOGIN',
  TRIGGER_LOGIN_REFRESH = '[Auth] TRIGGER_LOGIN_REFRESH',
  LOGIN = '[Auth] LOGIN',
  LOGOUT = '[Auth] LOGOUT'
}

export class Token {
  constructor(public readonly accessToken: string, public readonly idToken: string, public readonly expiresAt: Date) {}
}

export class AuthModel {
  constructor(public readonly token?: Token, public readonly userInfo?: UserInfo) {}
}

export class TriggerLoginAction implements Action {
  readonly type = AuthActionTypes.TRIGGER_LOGIN;
  readonly payload: {
    redirectPath: any[];
  };

  /**
   * Trigger's an Auth0 login, by redirecting to an external website.
   * @param redirectPath The redirect path using angular's Router path format, eg [ '/some-path', {'some-param': 1} ]
   */
  constructor(redirectPath: any[]) {
    this.payload = { redirectPath };
  }
}

export class TriggerLoginRefreshAction implements Action {
  readonly type = AuthActionTypes.TRIGGER_LOGIN_REFRESH;
}

export class LoginAction implements Action {
  readonly type = AuthActionTypes.LOGIN;
  constructor(public readonly payload: Token) {}
}

export class LogoutAction implements Action {
  readonly type = AuthActionTypes.LOGOUT;
}

export type AuthActionsUnion = TriggerLoginAction | LoginAction | TriggerLoginRefreshAction | LogoutAction;
