// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
const maxColorLength = 6;

export function filterColor(hexCode: string) {
  // Remove non-alphanumeric characters from hex code, then make upper case
  return hexCode
    .replace(/[^0-9A-Fa-f]/g, '')
    .toUpperCase()
    .substring(0, maxColorLength);
}
