// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const num = parseInt(value, 10);
    if (num >= 1000000) {
      const rounded = Math.round(num / 100000) / 10;
      return `${rounded}M`;
    } else if (num >= 1000) {
      const rounded = Math.round(num / 100) / 10;
      return `${rounded}K`;
    }
    return `${num}`;
  }
}
