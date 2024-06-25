// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import * as jwtDecode from 'jwt-decode';
import { AuthActionsUnion, AuthActionTypes, AuthModel, Token } from './auth.actions';
import { UserInfo } from '../models';

interface TokenInfo {
  sub: string;
  email: string;
  picture: string;
  name: string;
  givenName: string;
  familyName: string;
  exp: number;
}

export const getAuthState = createFeatureSelector<AuthModel>('auth');
export const getLoggedInState = createSelector(getAuthState, authState => {
  if (authState === undefined) {
    return false;
  }
  const { token } = authState;
  if (token === undefined) {
    return false;
  }

  return token.expiresAt.getTime() > Date.now();
});

export const getTokenState = createSelector(getAuthState, authState => {
  if (authState === undefined || authState.token === undefined) {
    return;
  }
  return authState.token;
});

export const getUserInfoState = createSelector(getAuthState, authState => {
  if (authState === undefined) {
    return;
  }
  return authState.userInfo;
});

export function getUserInfo(token: Token): UserInfo {
  const userInfoResponse = jwtDecode(token.idToken) as TokenInfo;
  const expiry = new Date(0);
  expiry.setUTCSeconds(userInfoResponse.exp);
  return {
    userId: userInfoResponse.sub,
    name: userInfoResponse.name,
    givenName: userInfoResponse.givenName,
    familyName: userInfoResponse.familyName,
    email: userInfoResponse.email,
    avatarUrl: userInfoResponse.picture,
    expiry
  };
}

export function authReducer(state: Readonly<AuthModel> = {}, action: Action): Readonly<AuthModel> {
  const authAction = action as AuthActionsUnion;
  switch (authAction.type) {
    case AuthActionTypes.LOGIN:
      return { ...state, token: authAction.payload, userInfo: getUserInfo(authAction.payload) };

    case AuthActionTypes.LOGOUT:
      const { token, userInfo, ...remainder } = state;
      return remainder;
  }
  return state;
}
