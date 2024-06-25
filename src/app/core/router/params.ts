// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function readParameterFromRouterState(route: ActivatedRoute, param: string): string | undefined {
  // Only the bottom most child of the route snapshot contains the url parameter map.
  let root: ActivatedRouteSnapshot | null = route.snapshot.root;
  while (root !== null) {
    const output = root.paramMap.get(param);
    if (output !== null) {
      return output;
    }

    root = root.firstChild;
  }
  return;
}

export function getObservableQueryParam(route: ActivatedRoute, param: string): Observable<string | undefined> {
  return route.queryParamMap.pipe(
    map(query => {
      const cursor = query.get(param);
      if (cursor === null) {
        return undefined;
      }
      return cursor;
    })
  );
}
