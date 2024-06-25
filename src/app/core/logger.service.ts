// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
/* tslint:disable-next-line:no-console */

import { Injectable, Inject, InjectionToken } from '@angular/core';

export enum LogLevel {
  None = -1,
  Error = 0,
  Warn = 1,
  Verbose = 2
}

export const LOG_LEVEL_TOKEN = new InjectionToken<LogLevel>('logLevel');

@Injectable()
export class LoggerService {
  /**
   * Logs a message to console.error if the LogLevel is Error or above.
   */
  readonly error = (message: string) => {};

  /**
   * Logs a message to console.warn if the LogLevel is  Warn or above.
   */
  readonly warn = (message: string) => {};

  /**
   * Logs a message to console.log if the LogLevel is Verbose or above.
   */
  readonly verbose = (message: string) => {};

  constructor(@Inject(LOG_LEVEL_TOKEN) private level: LogLevel) {
    // This is a trick to preserve the line number the logging function was called from.
    if (this.level >= LogLevel.Error) {
      this.error = console.error.bind(window.console);
    }
    if (this.level >= LogLevel.Warn) {
      this.warn = console.warn.bind(window.console);
    }
    if (this.level >= LogLevel.Verbose) {
      this.verbose = console.log.bind(window.console);
    }
    Object.freeze(this);
  }
}
