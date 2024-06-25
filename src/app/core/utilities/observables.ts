// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { RouterStateUrl } from '@app/core';
import { Actions, ofType } from '@ngrx/effects';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

export function onStoreInitialized(actions$: Actions) {
  return actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    take(1),
    map(action => null)
  );
}

/**
 * Pipeable operator which filters actions from the router, based on url.
 * @param route Only continue with RouterNavigationAction starting with this route.
 */
export function isNavigationActionToRoute<
  T extends RouterNavigationAction<RouterStateUrl> = RouterNavigationAction<RouterStateUrl>
>(route: string) {
  return (source: Observable<Action>) => {
    return source.pipe(
      ofType(ROUTER_NAVIGATION),
      map(action => action as T),
      filter(routerAction => {
        const url = routerAction.payload.routerState.url;
        return url.startsWith(route) || url.startsWith(`/${route}`);
      })
    );
  };
}
