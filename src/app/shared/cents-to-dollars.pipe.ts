// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Pipe, PipeTransform } from '@angular/core';

const CENTS_TO_DOLLARS = 0.01;

@Pipe({
  name: 'centsToDollars'
})
export class CentsToDollarsPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const num = parseInt(value, 10);
    return num * CENTS_TO_DOLLARS;
  }
}
