// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';

@Injectable()
export class WindowRef {
  get nativeWindow(): any {
    return window;
  }
}
