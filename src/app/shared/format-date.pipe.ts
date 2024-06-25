// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(date: any, args?: any): any {
    return date ? (date as string).replace(/([0-9]{2}:?){3} \+[0-9]+$/, '') : '–';
  }
}
