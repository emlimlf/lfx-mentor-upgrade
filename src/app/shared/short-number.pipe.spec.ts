// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ShortNumberPipe } from './short-number.pipe';

describe('ShortNumberPipe', () => {
  it("doesn't modify values under 1000", () => {
    const pipe = new ShortNumberPipe();
    const output = pipe.transform('999');
    expect(output).toEqual('999');
  });
  it('modifies 1000 to 1k', () => {
    const pipe = new ShortNumberPipe();
    const output = pipe.transform(1000);
    expect(output).toEqual('1k');
  });
  it('rounds values to nearest hundred', () => {
    const pipe = new ShortNumberPipe();
    const output = pipe.transform(1234);
    expect(output).toEqual('1.2k');
  });
});
