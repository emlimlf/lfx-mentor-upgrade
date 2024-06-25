// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable, Inject, InjectionToken } from '@angular/core';
import { LoggerService } from './logger.service';

export interface FlagList {
  [key: string]: boolean;
}

export const FLAGS_TOKEN = new InjectionToken<FlagList>('flags');

@Injectable()
export class FlagsService {
  constructor(@Inject(FLAGS_TOKEN) private flags: FlagList, private logger: LoggerService) {}

  allowed(key: string): boolean {
    if (this.flags[key] === undefined) {
      this.logger.error(`Missing configuration for queried flag '${key}'. Defaulting to false.`);
      return false;
    }
    return this.flags[key];
  }
}
