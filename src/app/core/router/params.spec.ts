// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { readParameterFromRouterState } from '.';
import { getObservableQueryParam } from '@app/core/router/params';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject } from 'rxjs';

describe('readParameterFromRouterState', () => {
  const emptyParamMap = new Map<string, any>();
  emptyParamMap.set('anotherId', null);
  emptyParamMap.set('value', null);

  const paramMap = new Map<string, any>();
  paramMap.set('anotherId', 'some-id');
  paramMap.set('value', 'another-value');
  const url = 'https://some-url';

  it('serializes a RouterStateUrl from a complex RouterStateSnapshot', () => {
    const route = {
      snapshot: {
        url,
        root: {
          paramMap: emptyParamMap,
          firstChild: {
            paramMap: emptyParamMap,
            firstChild: {
              firstChild: null,
              paramMap
            }
          }
        }
      }
    } as any;
    const output = readParameterFromRouterState(route, 'anotherId');
    expect(output).toEqual('some-id');
  });
});

describe('getObservableQueryParam', () => {
  it('returns an observable of the given query param', () => {
    const key = 'key';
    const queryParamMap = cold('abc', {
      a: new Map([[key, '1']]),
      b: new Map([]),
      c: new Map([[key, '3']])
    });
    const activatedRoute = { queryParamMap } as any;
    const output = getObservableQueryParam(activatedRoute, key);

    expect(output).toBeObservable(cold('abc', { a: '1', b: undefined, c: '3' }));
  });
});
