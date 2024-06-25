// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { colorsWCAGCompliant, getColorRGBValues, getWCAGColorContrastRatio } from './colors';

describe('getColorRGBValues', () => {
  it('can parse 6 character hex values', () => {
    const output = getColorRGBValues('#FF00FF');
    expect(output).toEqual({ red: 255, green: 0, blue: 255 });
  });
  it('can parse 3 character hex values', () => {
    const output = getColorRGBValues('#F0F');
    expect(output).toEqual({ red: 255, green: 0, blue: 255 });
  });
  it('can parse an arbitary hex value', () => {
    const output = getColorRGBValues('#1F2E3D');
    expect(output).toEqual({ red: 31, green: 46, blue: 61 });
  });
});

describe('getWCAGColorContrastRatio', () => {
  it('calculates blue on red constrast correctly', () => {
    const blue = '#068EFF';
    const red = '#FF3323';
    const output = getWCAGColorContrastRatio(blue, red);
    expect(output).toBeCloseTo(1.1);
  });
  it('calculates black on white constrast correctly', () => {
    const black = '#000000';
    const white = '#FFFFFF';
    const output = getWCAGColorContrastRatio(black, white);
    expect(output).toBeCloseTo(21);
  });
  it('calculates white on black constrast correctly', () => {
    const black = '#000000';
    const white = '#FFFFFF';
    const output = getWCAGColorContrastRatio(white, black);
    expect(output).toBeCloseTo(21);
  });

  it('calculates white on white constrast correctly', () => {
    const white = '#FFFFFF';
    const output = getWCAGColorContrastRatio(white, white);
    expect(output).toBeCloseTo(1);
  });
});

describe('colorsWCAGCompliant', () => {
  it('returns true for colors at the minimum constrast ratio', () => {
    const white = '#FFFFFF';
    const grey = '#777771';
    const output = colorsWCAGCompliant(white, grey);
    expect(output).toBeTruthy();
  });
  it('returns false for colors below the minimum constrast ratio', () => {
    const white = '#FFFFFF';
    const grey = '#777777';
    const output = colorsWCAGCompliant(white, grey);
    expect(output).toBeFalsy();
  });
});
