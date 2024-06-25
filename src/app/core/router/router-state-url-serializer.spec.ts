// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ParamMap, Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateUrl, RouterStateUrlSerializer } from './router-state-url-serializer';

describe('RouterStateUrlSerializer', () => {
  const queryParams = {
    id: 1,
    value: 2
  };

  const queryParamMap = new Map<string, any>();
  queryParamMap.set('id', 1);
  queryParamMap.set('value', 2);

  const params = {
    anotherId: 'some-id',
    value: 'another-value'
  };
  const paramMap = new Map<string, any>();
  paramMap.set('anotherId', 'some-id');
  paramMap.set('value', 'another-value');
  const url = 'https://some-url';

  it('serializes a RouterStateUrl from a complex RouterStateSnapshot', () => {
    const snapshot = {
      url,
      root: {
        queryParamMap,
        queryParams,
        firstChild: {
          firstChild: {
            params,
            paramMap
          }
        }
      }
    } as any;
    const serializer = new RouterStateUrlSerializer();
    const output = serializer.serialize(snapshot);
    const expected = {
      queryParamMap,
      queryParams,
      paramMap,
      params,
      url
    } as any;
    expect(output).toEqual(expected);
  });
});
