// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { isNavigationActionToRoute, onStoreInitialized } from '.';
import { Actions, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { cold } from 'jasmine-marbles';

describe('onStoreInitialized', () => {
  it('returns null on after the effects store is initialized', () => {
    const input = cold('(a|)', { a: { type: ROOT_EFFECTS_INIT } });
    const expected = cold('(a|)', { a: null });
    const output = onStoreInitialized(new Actions(input));
    expect(output).toBeObservable(expected);
  });
});

describe('isNavigationActionToRoute', () => {
  function makeActionWithRoute(route: string): RouterNavigationAction {
    return {
      type: ROUTER_NAVIGATION,
      payload: {
        routerState: {
          url: route
        }
      }
    } as RouterNavigationAction;
  }
  it('passes actions on which match the route', () => {
    const input = cold('a', { a: makeActionWithRoute('/auth') });
    const output = isNavigationActionToRoute('/auth')(input);
    expect(output).toBeObservable(input);
  });
  it('filters out invalid routes', () => {
    const input = cold('a', { a: makeActionWithRoute('/some-other-route') });
    const output = isNavigationActionToRoute('/auth')(input);
    const expected = cold('-');
    expect(output).toBeObservable(expected);
  });
});
