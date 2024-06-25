// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, of, Observable, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { tap, catchError, concatMap, shareReplay, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as querystring from 'query-string';
import Url from 'url-parse';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth0Options = {
    domain: environment.AUTH_DOMAIN,
    clientId: environment.AUTH_CLIENT_ID,
    callbackUrl: window.location.origin,
    logoutUrl: window.location.origin,
  };

  currentHref = window.location.href;

  loading$ = new BehaviorSubject<any>(true);
  // Create an observable of Auth0 instance of client
  auth0Client$ = (from(
    createAuth0Client({
      domain: this.auth0Options.domain,
      client_id: this.auth0Options.clientId,
      redirect_uri: this.auth0Options.callbackUrl,
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1), // Every subscription receives the same shared value
    catchError(err => {
      this.loading$.next(false);
      return throwError(err);
    })
  );
  // Define observables for SDK methods that return promises by default
  // For each Auth0 SDK method, first ensure the client instance is ready
  // concatMap: Using the client instance, call SDK method; SDK returns a promise
  // from: Convert that resulting promise into an observable
  isAuthenticated$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap((res: any) => {
      // *info: once isAuthenticated$ responses , SSO sessiong is loaded
      this.loading$.next(false);
      this.loggedIn = res;
    })
  );
  handleRedirectCallback$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback(this.currentHref)))
  );
  // Create subject and public observable of user profile data
  private userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();
  // User's logged in state.
  loggedIn = false;

  constructor(private router: Router) {
    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    const params = this.currentHref;
    if (params.includes('code=') && params.includes('state=')) {
      this.handleAuthCallback();
    } else {
      this.localAuthSetup();
      this.handlerReturnToAfterLogout();
    }
  }

  handlerReturnToAfterLogout() {
    const { query } = querystring.parseUrl(this.currentHref) || { query: '' };
    const { returnTo } = query || { returnTo: '' };

    if (returnTo) {
      const target = this.getTargetRouteFromReturnTo(returnTo);
      this.router.navigate([target]);
    }
  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser
  // getUser$(options?: any): Observable<any> {
  //   return this.auth0Client$.pipe(
  //     concatMap((client: Auth0Client) => from(client.getUser(options))),
  //     tap(user => {
  //       this.userProfileSubject$.next(user);
  //     })
  //   );
  // }
  getUser$(options?: any): Observable<any> {
    return this.auth0Client$.pipe(
      map(async (client: any) => {
        let user: any = {};
        try {
          user = await client.getUser(options);
          this.userProfileSubject$.next(user);
        } catch (err) {
          console.log('Error : ', err);
        }
        return user;
      })
    );
  }

  private localAuthSetup() {
    // This should only be called on app initialization
    // Set up local authentication streams
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          // If authenticated, get user and set in app
          // NOTE: you could pass options here if needed
          this.loading$.next(false);
          return this.getUser$();
        }
        this.auth0Client$
          .pipe(
            // https://auth0.com/docs/libraries/auth0-single-page-app-sdk#get-access-token-with-no-interaction
            // *info: Allow check user session in public pages to avoid redirecting to login page
            concatMap((client: any) => client.getTokenSilently()),
            concatMap(() => this.getUser$()),
            concatMap(user => {
              if (user) {
                return this.isAuthenticated$;
              }
              return of(null);
            }),
            catchError(error => {
              // *info: by pass error, no needed, it is login_required
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading$.next(false);
          });
        // If not authenticated, return stream that emits 'false'
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  private getTargetRouteFromAppState(appState: any) {
    if (!appState) {
      return '/';
    }

    const { returnTo, target, targetUrl } = appState;

    return this.getTargetRouteFromReturnTo(returnTo) || target || targetUrl || '/';
  }

  private getTargetRouteFromReturnTo(returnTo: any) {
    if (!returnTo) {
      return '';
    }
    const { pathname, hash } = new Url(returnTo);
    return `${pathname}${hash}` || '/';
  }

  private handleAuthCallback() {
    // Call when app reloads after user logs in with Auth0
    const params = this.currentHref;

    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute = '/'; // Path to redirect to after login processsed
      const authComplete$ = this.handleRedirectCallback$.pipe(
        // Have client, now call method to handle auth callback redirect
        tap((cbRes: any) => {
          targetRoute = this.getTargetRouteFromAppState(cbRes.appState);
        }),
        concatMap(() => {
          // Redirect callback complete; get user and login status
          return combineLatest([this.getUser$(), this.isAuthenticated$]);
        })
      );
      // Subscribe to authentication completion observable
      // Response will be an array of user and login status
      authComplete$.subscribe(() => {
        // Redirect to target route after callback processing
        // *info: this url change will remove the code and state from the URL
        // * this is need to avoid invalid state in the next refresh

        this.router.navigateByUrl(targetRoute);
      });
    }
  }

  login(redirectPath: string = '/') {
    // A desired redirect path can be passed to login method
    // (e.g., from a route guard)
    // Ensure Auth0 client instance exists
    const redirectUri = `${this.auth0Options.callbackUrl}${window.location.search}`;
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log in
      client.loginWithRedirect({
        redirect_uri: redirectUri,
        appState: { target: redirectPath },
      });
    });
  }

  logout() {
    const { query, fragmentIdentifier } = querystring.parseUrl(window.location.href, { parseFragmentIdentifier: true });

    const qs = {
      ...query,
      returnTo: window.location.href,
    };

    const searchStr = querystring.stringify(qs);
    const searchPart = searchStr ? `?${searchStr}` : '';

    const fragmentPart = fragmentIdentifier ? `#${fragmentIdentifier}` : '';

    const logoutUrl = this.auth0Options.logoutUrl;

    const request = {
      client_id: this.auth0Options.clientId,
      returnTo: `${logoutUrl}${searchPart}${fragmentPart}`,
    };

    this.auth0Client$.subscribe((client: Auth0Client) => client.logout(request));

    localStorage.clear();
  }

  getTokenSilently$(options?: any): Observable<any> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) => from(client.getTokenSilently(options))));
  }

  getIdToken$(options?: any): Observable<any> {
    return this.auth0Client$.pipe(
      // *info: if getIdToken fails , just return empty in the catchError
      concatMap((client: Auth0Client) => from(client.getIdTokenClaims(options))),
      concatMap((claims: any) => of((claims && claims.__raw) || '')),
      catchError(() => of(''))
    );
  }
}
