// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { roundChargeAmount } from './charges';

describe('roundChargeAmount', () => {
  it('rounds up to the nearest dollar', () => {
    const maxAmount = 5000;
    const output = roundChargeAmount(1.586, maxAmount);
    expect(output).toEqual(2);
  });
  it('caps the amount to a maximum', () => {
    const maxAmount = 100;
    const output = roundChargeAmount(101, maxAmount);
    expect(output).toEqual(maxAmount);
  });
  it('sets a minimum amount of 0', () => {
    const maxAmount = 100;
    const output = roundChargeAmount(-1, maxAmount);
    expect(output).toEqual(0);
  });
});
