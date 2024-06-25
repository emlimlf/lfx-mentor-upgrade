// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    const url = (value as string).trim();

    if (url.startsWith('http://')) {
      return this.removeCharactersFromStringStart(url, 7);
    }
    if (url.startsWith('https://')) {
      return this.removeCharactersFromStringStart(url, 8);
    }

    return url;
  }

  private removeCharactersFromStringStart(str: string, count: number) {
    return str.slice(count, str.length);
  }
}
