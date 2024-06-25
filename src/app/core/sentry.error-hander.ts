// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ErrorHandler, Injectable } from '@angular/core';
import { SentryService } from './sentry.service';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(private sentryService: SentryService) {}

  handleError(err: any): void {
    const finalError = err.originalError !== undefined ? err.originalError : err;
    this.sentryService.captureException(finalError);
  }
}
