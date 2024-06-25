// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export function describeArc(x: number, y: number, radius: number, startAngleRadians: number, endAngleRadians: number) {
  const start = polarToCartesian(x, y, radius, endAngleRadians);
  const end = polarToCartesian(x, y, radius, startAngleRadians);

  // If a section is larger than a half circle, (PI), then we need to make sure the SVG arc takes the longest path.
  const largeArcFlag = endAngleRadians - startAngleRadians <= Math.PI ? '0' : '1';
  const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');

  return d;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number) {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
