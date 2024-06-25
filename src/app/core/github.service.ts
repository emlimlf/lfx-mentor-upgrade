// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { API_KEY } from './environment.configuration';
import { RouterStateUrl } from './router';
import { getGithubRedirectRoute } from './utilities';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { WINDOW_KEY } from './window';

export const GITHUB_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_CLIENT_ID_KEY = new InjectionToken('GITHUB_CLIENT_ID_KEY');

export interface GithubCallbackResult {
  redirectPath: any[];
}

@Injectable()
export class GithubService {
  constructor(
    @Inject(WINDOW_KEY) private window: Window,
    @Inject(GITHUB_CLIENT_ID_KEY) private githubId: string,
    private httpService: HttpClient,
    @Inject(API_KEY) private api: string
  ) {}

  redirectToGithub(requestId: string, targetRoute: any[]) {
    const state = this.encodeState(requestId, targetRoute);
    const redirectUrl = getGithubRedirectRoute(this.window.location);

    const address = `${GITHUB_URL}?redirect_uri=${redirectUrl}&client_id=${
      this.githubId
    }&state=${state}&scope=read:org`;
    this.window.location.href = address;
  }

  public readAndVerifyTokenFromBrowserURL(
    requestId: string,
    routerState: RouterStateUrl
  ): Observable<GithubCallbackResult> {
    const state = routerState.queryParamMap.get('state');
    if (state === null) {
      return throwError(new Error("State doesn't exist in route"));
    }

    const decodedState = this.decodeState(state);
    if (decodedState === undefined || decodedState.requestId !== requestId) {
      return throwError(new Error("RequestId doesn't match"));
    }

    const code = routerState.queryParamMap.get('code');
    if (code === null) {
      return throwError(new Error("Code doesn't exist in route"));
    }

    const route = `${this.api}/me/accounts`;
    const body = {
      type: 'github',
      code
    };
    return this.httpService.post(route, body).pipe(
      map(_ => {
        return { redirectPath: decodedState.redirectPath };
      })
    );
  }

  private encodeState(requestId: string, redirectPath: any[]): string {
    const obj = {
      redirectPath,
      requestId
    };
    return encodeURIComponent(JSON.stringify(obj));
  }

  private decodeState(state: string) {
    const obj = JSON.parse(state);
    if (obj.requestId === undefined || obj.redirectPath === undefined) {
      return;
    }
    const requestId = obj.requestId as string;
    const redirectPath = obj.redirectPath as any[];
    return { redirectPath, requestId };
  }
}
