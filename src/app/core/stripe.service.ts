// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { RouterStateUrl } from '.';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { filter, map, share, startWith, take } from 'rxjs/operators';
import { getStripeRedirectRoute } from './utilities';
import { WINDOW_KEY } from './window';


export const STRIPE_API_KEY_KEY = new InjectionToken('STRIPE_API_KEY');

export const STRIPE_URL = 'https://connect.stripe.com/express/oauth/authorize';

export interface StripeCallbackResult {
  redirectPath: any[];
  code: string;
  projectId: string;
}

@Injectable()
export class StripeService {
  /**
   * The Stripe library is loaded asynchronously, and from an external source. This observable retrieves it when it is
   * available.
   */
  readonly stripeJS$: Observable<stripe.Stripe> = interval(100).pipe(
    startWith(0),
    map(_ => (this.window as any).Stripe as stripe.StripeStatic),
    filter(Stripe => Stripe !== undefined),
    map(Stripe => Stripe(this.stripeApiKey)),
    take(1),
    share()
  );

  constructor(@Inject(WINDOW_KEY) private window: Window, @Inject(STRIPE_API_KEY_KEY) private stripeApiKey: string) {}

  public readAndVerifyTokenFromBrowserURL(
    requestId: string,
    routerState: RouterStateUrl
  ): StripeCallbackResult | undefined {
    const code = routerState.queryParamMap.get('code');
    const state = routerState.queryParamMap.get('state');
    if (code === null || state === null) {
      return;
    }
    const decodedState = this.decodeState(state);
    if (decodedState === undefined || decodedState.requestId !== requestId) {
      return;
    }
    return { redirectPath: decodedState.redirectPath, code, projectId: decodedState.projectId };
  }

  public calculateStripeFee(amount: number) {
    const baseFee = 0.3;
    return amount * 0.029 + baseFee;
  }

  private encodeState(requestId: string, redirectPath: any[], projectId: string): string {
    const obj = {
      redirectPath,
      requestId,
      projectId
    };
    return encodeURIComponent(JSON.stringify(obj));
  }

  private decodeState(state: string) {
    const obj = JSON.parse(decodeURIComponent(state));
    if (obj.requestId === undefined || obj.redirectPath === undefined || obj.projectId === undefined) {
      return;
    }
    const requestId = obj.requestId as string;
    const redirectPath = obj.redirectPath as any[];
    const projectId = obj.projectId as string;
    return { redirectPath, requestId, projectId };
  }
}
