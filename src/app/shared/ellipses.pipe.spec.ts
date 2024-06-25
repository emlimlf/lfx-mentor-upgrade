// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { EllipsesPipe } from './ellipses.pipe';

describe('EllipsesPipe', () => {
  it('replaces the last three characters with ellipses when text exceeds max length', () => {
    const pipe = new EllipsesPipe();
    const longText = 'This sentence is too long';
    const maxLength = 10;
    const value = pipe.transform(longText, maxLength);
    expect(value).toEqual('This se...');
  });

  it('returns the text as input when text matches max length', () => {
    const pipe = new EllipsesPipe();
    const longText = 'This sentence is too long';
    const maxLength = 26;
    const value = pipe.transform(longText, maxLength);
    expect(value).toEqual(longText);
  });

  it('returns the text as input when no max length is specified', () => {
    const pipe = new EllipsesPipe();
    const longText = 'This sentence is too long';
    const value = pipe.transform(longText);
    expect(value).toEqual(longText);
  });

  it('returns the text as input when max length is smaller than 3', () => {
    const pipe = new EllipsesPipe();
    const longText = 'This sentence is too long';
    const maxLength = 2;
    const value = pipe.transform(longText, maxLength);
    expect(value).toEqual(longText);
  });
});
