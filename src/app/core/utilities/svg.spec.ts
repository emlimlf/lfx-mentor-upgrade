// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { describeArc, polarToCartesian } from '.';

describe('describeArc', () => {
  it('creates the path for a small arc less than PI', () => {
    const x = 0;
    const y = 0;
    const radius = 50;
    const startAngle = Math.PI / 4; // 45 degrees
    const endAngle = (3 * Math.PI) / 4; // 135 degrees
    const largeArcFlag = 0;
    const output = describeArc(x, y, radius, startAngle, endAngle);

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    expect(output).toEqual(`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`);
  });
  it('creates the path for a large arc greater than PI', () => {
    const x = 0;
    const y = 0;
    const radius = 50;
    const startAngle = Math.PI / 4; // 45 degrees
    const endAngle = (6 * Math.PI) / 4; // 270 degrees
    const largeArcFlag = 1;
    const output = describeArc(x, y, radius, startAngle, endAngle);

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    expect(output).toEqual(`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`);
  });
});

describe('polarToCartesian', () => {
  it('returns a value at 0 radians', () => {
    const x = 10;
    const y = 45;
    const radius = 50;
    const output = polarToCartesian(x, y, radius, 0);
    expect(output).toEqual({ x: x + radius, y });
  });
  it('returns a value at PI/2 radians', () => {
    const x = 10;
    const y = 45;
    const radius = 50;
    const output = polarToCartesian(x, y, radius, Math.PI / 2);
    expect(output.x).toBeCloseTo(x);
    expect(output.y).toBeCloseTo(y + radius);
  });
});
