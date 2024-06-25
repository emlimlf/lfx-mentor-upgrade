// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lineBreak'
})
export class LineBreakPipe implements PipeTransform {

  transform(value: string ): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
}
