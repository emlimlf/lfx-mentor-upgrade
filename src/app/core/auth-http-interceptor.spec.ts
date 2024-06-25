// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HTTP_INTERCEPTORS, HttpClient, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { API_KEY, Token, TriggerLoginRefreshAction } from '.';
import { AuthHttpInterceptor } from './auth-http-interceptor';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

describe('AuthHttpInterceptor', () => {
  const api = 'https://some-url';

  const idToken = '1234';
  const accessToken = '4567';
  let token$: BehaviorSubject<Token | undefined>;
  let now: Date;
  let dateInFuture: Date;
  let dateInPast: Date;
  let store: any;

  function requestHasAuth(request: HttpRequest<any>) {
    return request.headers.has('Authorization') && request.headers.get('Authorization') === `Bearer ${idToken}`;
  }

  function requestMissingAuth(request: HttpRequest<any>) {
    return !request.headers.has('Authorization');
  }

  beforeEach(() => {
    now = new Date();
    jasmine.clock().mockDate(now);
    dateInFuture = new Date(now.getTime() + 60 * 60);
    dateInPast = new Date(now.getTime() - 60 * 60);
    token$ = new BehaviorSubject<Token | undefined>(undefined);

    store = {
      select: jasmine.createSpy('select').and.returnValue(token$),
      dispatch: jasmine.createSpy('dispatch')
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthHttpInterceptor,
          multi: true
        },
        {
          provide: API_KEY,
          useValue: api
        },
        {
          provide: Store,
          useValue: store
        }
      ]
    });
  });

  it('adds authorization header when token is present in store', inject(
    [HttpClient, HttpTestingController],
    (http: HttpClient, mock: HttpTestingController) => {
      token$.next({ accessToken, idToken, expiresAt: dateInFuture });
      http.get(`${api}/some-url`).subscribe(response => expect(response).toBeTruthy());
      mock.expectOne(req => requestHasAuth(req));
    }
  ));
  it("doesn't add authorization header when token isn't in store", inject(
    [HttpClient, HttpTestingController],
    (http: HttpClient, mock: HttpTestingController) => {
      http.get(`${api}/some-url`).subscribe(response => expect(response).toBeTruthy());
      mock.expectOne(req => requestMissingAuth(req));
    }
  ));
  it("doesn't add authorization header when token is expired", inject(
    [HttpClient, HttpTestingController],
    (http: HttpClient, mock: HttpTestingController) => {
      token$.next({ accessToken, idToken, expiresAt: dateInPast });
      http.get(`${api}/some-url`).subscribe(response => expect(response).toBeTruthy());
      mock.expectOne(req => requestMissingAuth(req));
    }
  ));
  it("doesn't add authorization header when request is to non API endpoint", inject(
    [HttpClient, HttpTestingController],
    (http: HttpClient, mock: HttpTestingController) => {
      token$.next({ accessToken, idToken, expiresAt: dateInFuture });
      http.get(`https://external.api/some-url`).subscribe(response => expect(response).toBeTruthy());
      mock.expectOne(req => requestMissingAuth(req));
    }
  ));

  it('retries the request with a new auth token when the request returns 401 Unauthorized', inject(
    [HttpClient, HttpTestingController],
    (http: HttpClient, mock: HttpTestingController) => {
      token$.next({ accessToken, idToken, expiresAt: dateInPast });

      http.get(`${api}/some-url`).subscribe(response => expect(response).toBeTruthy());
      const request = mock.expectOne(req => requestMissingAuth(req));
      const unauthorizedResponse = new ErrorEvent('Unauthorized');
      request.error(unauthorizedResponse, { status: 401 });

      expect(store.dispatch).toHaveBeenCalledWith(new TriggerLoginRefreshAction());
      token$.next({ accessToken, idToken, expiresAt: dateInFuture });
      mock.expectOne(req => requestHasAuth(req));
    }
  ));
});
