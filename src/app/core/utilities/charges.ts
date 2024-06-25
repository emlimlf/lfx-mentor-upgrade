// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export function roundChargeAmount(amount: number, maxAmount: number) {
  return roundAmount(amount, maxAmount, 0);
}

export function roundPercentage(amount: number, decimalPlaces: number) {
  return roundAmount(amount, 100, decimalPlaces);
}

export function roundAmount(amount: number, maxAmount: number, decimalPlaces: number) {
  if (decimalPlaces === null) {
    decimalPlaces = 0;
  }

  const amountInRange = Math.max(0, Math.min(amount, maxAmount)) * Math.pow(10, decimalPlaces);
  return Math.round(amountInRange) / Math.pow(10, decimalPlaces);
}
