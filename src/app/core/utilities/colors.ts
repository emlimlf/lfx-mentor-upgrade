// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export interface ColorRGB {
  red: number;
  green: number;
  blue: number;
}

export const WCAG_MINIMUM_CONTRAST = 4.5;

export function colorsWCAGCompliant(firstColor: string, secondColor: string) {
  const ratio = getWCAGColorContrastRatio(firstColor, secondColor);
  return ratio >= WCAG_MINIMUM_CONTRAST;
}

/**
 * Implements the WCAG color contrast algorithm https://www.w3.org/TR/WCAG20-TECHS/G18.html
 * @param firstColor A color in hex string format, eg. #FFFFFF
 * @param secondColor A color in hex string format, eg. #FFFFFF
 */
export function getWCAGColorContrastRatio(firstColor: string, secondColor: string) {
  const c1 = getColorRGBValues(firstColor);
  const c2 = getColorRGBValues(secondColor);
  const l1 = getRelativeLuminance(c1);
  const l2 = getRelativeLuminance(c2);

  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

export function getColorRGBValues(color: string): ColorRGB {
  if (matchesHexColorFormat(color)) {
    let c = color.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    return {
      red: parseHexPair(c[0], c[1]), // Parse first two hex characters into a number
      green: parseHexPair(c[2], c[3]),
      blue: parseHexPair(c[4], c[5])
    };
  }
  return { red: 0, green: 0, blue: 0 };
}

function parseHexPair(firstCharacter: string, secondCharacter: string) {
  return parseInt(`${firstCharacter}${secondCharacter}`, 16);
}

function matchesHexColorFormat(color: string) {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
}

// Calculates relative luminance: https://en.wikipedia.org/wiki/Relative_luminance
function getRelativeLuminance(color: ColorRGB): number {
  const r = convertColorGammaToLinear(color.red);
  const g = convertColorGammaToLinear(color.green);
  const b = convertColorGammaToLinear(color.blue);
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

// Converts a gamma space color component into linear space: https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
function convertColorGammaToLinear(component: number) {
  const normalised = component / 255;
  if (normalised <= 0.03928) {
    return normalised / 12.92;
  }
  return Math.pow((normalised + 0.055) / 1.055, 2.4);
}
