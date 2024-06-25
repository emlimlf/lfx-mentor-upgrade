// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  AuthModel,
  LoginAction,
  LogoutAction,
  Token,
  TriggerLoginAction,
  TriggerLoginRefreshAction
} from './auth.actions';
import { authReducer, getLoggedInState } from './auth.reducer';
import { UserInfo } from '../models';

const idToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHwxMjM0NSIsIm5hbWUiOiJEb2cgTWNEb2ciLCJlbWFpbCI6ImRvZy5tY2RvZ0Bk' +
  'b2djaGFpbi5jb20iLCJleHAiOjE1Mzk3MDEyMTAsInBpY3R1cmUiOiJodHRwczovL2RvZ3BpY3MuY29tL2RvZzEifQ.nKetFoKp1STkwCOA7EPvGyI0_ZZtRoF2rIcT35DwRio';
const userInfo: UserInfo = {
  name: 'Dog McDog',
  userId: 'auth0|12345',
  email: 'dog.mcdog@dogchain.com',
  avatarUrl: 'https://dogpics.com/dog1',
  expiry: new Date(0)
};

describe('authReducer', () => {
  it('stores a token on LoginAction', () => {
    const state: AuthModel = {};
    const token: Token = {
      accessToken: 'myAccessToken',
      idToken: idToken,
      expiresAt: new Date()
    };
    userInfo.expiry.setUTCSeconds(1539701210);
    const output = authReducer(state, new LoginAction(token));
    expect(output).toEqual({ token, userInfo });
  });

  it('removes a token on LogoutAction', () => {
    const state: AuthModel = {
      token: {
        accessToken: 'myAccessToken',
        idToken,
        expiresAt: new Date()
      }
    };
    const output = authReducer(state, new LogoutAction());
    expect(output).toEqual({});
  });

  it("doesn't modify the store on TriggerLoginAction", () => {
    const state = {};
    const output = authReducer(state, new TriggerLoginAction(['/']));
    expect(output).toEqual({});
  });

  it("doesn't modify the store on TriggerLoginRefreshAction", () => {
    const state = {};
    const output = authReducer(state, new TriggerLoginRefreshAction());
    expect(output).toEqual({});
  });
});

describe('getLoggedInState', () => {
  it('returns true when authState has a token', () => {
    const state = {
      auth: {
        token: {
          accessToken: 'myAccessToken',
          idToken,
          expiresAt: new Date(Date.now() + 60 * 1000)
        }
      }
    };
    const output = getLoggedInState(state);
    expect(output).toBeTruthy();
  });
  it("returns false when authState doesn't have a token", () => {
    const state = {
      auth: {}
    };
    const output = getLoggedInState(state);
    expect(output).toBeFalsy();
  });

  it('returns false when authState is missing', () => {
    const state = {};
    const output = getLoggedInState(state);
    expect(output).toBeFalsy();
  });
});
