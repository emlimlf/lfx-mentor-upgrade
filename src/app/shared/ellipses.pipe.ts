// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipses'
})
export class EllipsesPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (args === undefined || typeof args !== 'number' || value === undefined) {
      return value;
    }
    if (args < 3) {
      return value;
    }

    return this.ellideText(value, args);
  }

  private ellideText(text: string, length: number) {
    if (text.length < length) {
      return text;
    }
    return `${text.substring(0, length - 3)}...`;
  }
}
