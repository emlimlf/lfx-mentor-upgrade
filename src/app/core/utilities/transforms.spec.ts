// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { removeUndefined } from './transforms';

describe('removeUndefined', () => {
  interface TestInterface {
    a?: string;
    b?: string;
  }

  it('removes an undefined field from the property list', () => {
    const test: TestInterface = {
      a: '10',
      b: undefined
    };
    const output = removeUndefined(test);
    expect(output).toEqual({
      a: '10'
    });
  });
});
