// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { filterColor } from './filter-color';

describe('filterColor', () => {
  it('processes a user-provided hex code to remove illegal characters', () => {
    const hexCode = 'AA-02FZ_&';
    const output = filterColor(hexCode);
    expect(output).toEqual('AA02F');
  });
  it('converts the provided hex code to upper case', () => {
    const hexCode = 'aAFfB';
    const output = filterColor(hexCode);
    expect(output).toEqual('AAFFB');
  });
  it('truncates hex codes longer than 6 characters', () => {
    const hexCode = '1234567';
    const output = filterColor(hexCode);
    expect(output).toEqual('123456');
  });
});
