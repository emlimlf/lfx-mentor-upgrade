// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { getAuthURL, getAuthURLFromWindow } from './path';

describe('getAuthURL', () => {
  it('adds a port to the url when a non standard HTTP/S port is used', () => {
    const location: any = new URL('https://some-url:4200/somepath');
    const output = getAuthURL(location);
    expect(output).toEqual('https://some-url:4200/auth');
  });
  it("doesn't add a port when a standard HTTP/S port is used", () => {
    const location: any = new URL('https://some-url:443/somepath');
    const output = getAuthURL(location);
    expect(output).toEqual('https://some-url/auth');
  });
});

describe('getAuthURLFromWindow', () => {
  it('returns a string ending in /auth', () => {
    const output = getAuthURLFromWindow();
    expect(output).toMatch(/(\/auth)/);
  });
});
