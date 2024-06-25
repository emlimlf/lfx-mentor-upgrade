// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { StripeService } from '.';

describe('StripeService', () => {
  const window = { location: { href: 'www.mywebsite.com/' } } as any;
  const stripeId = '1234';
  const stripeApiKey = '4567';
  const code = '1234';
  const path = ['/some-path'];
  const requestId = '5678';
  const projectId = '9101112';
  const error = new Error('Failed to parse stripe results');

  let stripeService: StripeService;

  function makeRouteSnapshot(
    codeParam: string | undefined,
    redirectPathParam: any[] | undefined,
    requestIdParam: string | undefined,
    requestProjectId: string | undefined
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
    if (requestProjectId !== undefined) {
      state.projectId = requestProjectId;
    }
    if (redirectPathParam !== undefined && requestIdParam !== undefined) {
      map.set('state', encodeURIComponent(JSON.stringify(state)));
    } else {
      map.set('state', null);
    }
    return { queryParamMap: map };
  }

  beforeEach(() => {
    stripeService = new StripeService(window, stripeApiKey);
  });

  describe('readAndVerifyTokenFromBrowserURL', () => {
    it('returns an observable with the route and token on success', () => {
      const snapshot = makeRouteSnapshot(code, path, requestId, projectId);
      const output = stripeService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output).toEqual({ code, redirectPath: path, projectId });
    });
    it('returns an observable with an error if code is missing from query params', () => {
      const snapshot = makeRouteSnapshot(undefined, path, requestId, projectId);
      const output = stripeService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output).toEqual(undefined);
    });
    it('returns an observable with an error if state is missing from query params', () => {
      const snapshot = makeRouteSnapshot(code, undefined, undefined, projectId);
      const output = stripeService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output).toEqual(undefined);
    });
    it('returns an observable with an error if state contains an incorrect requestId', () => {
      const snapshot = makeRouteSnapshot(code, path, 'incorrect-id', projectId);
      const output = stripeService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output).toEqual(undefined);
    });
    it('returns an observable with an error if state contains an incorrect projectId', () => {
      const snapshot = makeRouteSnapshot(code, path, requestId, undefined);
      const output = stripeService.readAndVerifyTokenFromBrowserURL(requestId, snapshot);
      expect(output).toEqual(undefined);
    });

    it('should set fee as 0.3 + 0.29 * amount', () => {
      const output = stripeService.calculateStripeFee(1.0);
      expect(output).toEqual(0.329);
    });
  });
});
