// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { API_KEY } from './environment.configuration';
import { WINDOW_KEY } from './window';
import { cold } from 'jasmine-marbles';
import { GITHUB_CLIENT_ID_KEY, GithubService } from './github.service';

describe('GithubService', () => {
  let githubService: GithubService;
  let window: any;
  const githubClientId = '1234';
  const requestId = '5678';
  const code = '1234';
  const path = ['/some-path'];
  const baseUrl = 'https://base-url.com';
  let httpMock: HttpTestingController;

  function makeRouteSnapshot(
    codeParam: string | undefined,
    redirectPathParam: any[] | undefined,
    requestIdParam: string | undefined
  ): any {
    const map = new Map<string, string | null>();
    if (codeParam !== undefined) {
      map.set('code', codeParam);
    } else {
      map.set('code', null);
    }
    const state: any = {};
    if (requestIdParam !== undefined) {
      state.requestId = requestIdParam;
    }
    if (redirectPathParam !== undefined) {
      state.redirectPath = redirectPathParam;
    }
    if (redirectPathParam !== undefined && requestIdParam !== undefined) {
      map.set('state', JSON.stringify(state));
    } else {
      map.set('state', null);
    }
    return { queryParamMap: map };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GithubService,
        { provide: API_KEY, useValue: baseUrl },
        { provide: GITHUB_CLIENT_ID_KEY, useValue: githubClientId },
        { provide: WINDOW_KEY, useValue: { location: { href: 'www.mywebsite.com/' } } }
      ]
    });
    const injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    githubService = injector.get(GithubService);
    window = injector.get(WINDOW_KEY);
  });

  describe('redirectToGithub', () => {
    it('redirects to github', () => {
      const targetRoute = ['/'];

      githubService.redirectToGithub(requestId, targetRoute);
      expect(window.location.href).toMatch(
        /^(https:\/\/github\.com\/login\/oauth\/authorize\?redirect_uri=).*(&client_id=1234&state=).*$/
      );
    });
  });

  describe('readAndVerifyTokenFromBrowserURL', () => {
    it('returns an observable with an error if code is missing from query params', () => {
      const snapshot = makeRouteSnapshot(undefined, path, requestId);
      const output$ = githubService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output$).toBeObservable(cold('#', undefined, new Error("Code doesn't exist in route")));
    });

    it('returns an observable with an error if state is missing from query params', () => {
      const snapshot = makeRouteSnapshot(code, undefined, undefined);
      const output$ = githubService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output$).toBeObservable(cold('#', undefined, new Error("State doesn't exist in route")));
    });

    it('returns an observable with an error if state contains an incorrect requestId', () => {
      const snapshot = makeRouteSnapshot(code, path, 'incorrect-id');
      const output$ = githubService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output$).toBeObservable(cold('#', undefined, new Error("RequestId doesn't match")));
    });

    it('returns an observable with a redirect url if the code is successfully exchanged on the backend', (done: DoneFn) => {
      const snapshot = makeRouteSnapshot(code, path, requestId);

      const output$ = githubService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);

      output$.subscribe(response => {
        expect(response.redirectPath).toEqual(path);
        done();
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/accounts`);
      expect(testRequest.request.method).toBe('POST');

      testRequest.flush({});
    });
  });
});
