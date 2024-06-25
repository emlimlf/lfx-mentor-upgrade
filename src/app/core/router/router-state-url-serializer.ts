// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ParamMap, Params, RouterStateSnapshot } from '@angular/router';
import {
  routerReducer,
  RouterReducerState,
  RouterStateSerializer,
  StoreRouterConnectingModule
  } from '@ngrx/router-store';
import { ActionReducerMap, StoreModule } from '@ngrx/store';

export interface RouterStateUrl {
  url: string;
  params: Params;
  paramMap: ParamMap;
  queryParams: Params;
  queryParamMap: ParamMap;
}

export class RouterStateUrlSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const { url, root: { queryParams, queryParamMap } } = routerState;
    const { params, paramMap } = route;

    // Only return an object including the URL, params and query params
    // instead of the entire snapshot
    return { url, params, paramMap, queryParams, queryParamMap };
  }
}
