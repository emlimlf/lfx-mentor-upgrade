// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { UrlPipe } from './url.pipe';

describe('UrlPipe', () => {
  it('removes https:// from start of string', () => {
    const pipe = new UrlPipe();
    const output = pipe.transform('https://some-value.com');
    expect(output).toEqual('some-value.com');
  });
  it('removes http:// from start of string', () => {
    const pipe = new UrlPipe();
    const output = pipe.transform('http://some-value.com');
    expect(output).toEqual('some-value.com');
  });
  it('leaves other strings intact', () => {
    const pipe = new UrlPipe();
    const output = pipe.transform('some-value.com');
    expect(output).toEqual('some-value.com');
  });
});
