// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export const ALMOST_2_PI = Math.PI * 1.9999999;
export function percentageToRadians(percentage: number) {
  // Our PI chart starts at 12 o'clock, so we have to rotate 1 quarter of a circle back.
  // We also don't want 100% to map to 2PI/0PI directly, because if a single segment has 100% of a circle, it's start
  // and end will be in the same position, therefore nothing will be drawn.
  return (percentage - 0.25) * ALMOST_2_PI;
}
