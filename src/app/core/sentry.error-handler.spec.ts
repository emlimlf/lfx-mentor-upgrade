// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { SentryErrorHandler } from './sentry.error-hander';
import { SentryService } from './sentry.service';

describe('SentryErrorHandler', () => {
  let sentryService: SentryService;
  let sentryErrorHandler: SentryErrorHandler;
  beforeEach(() => {
    sentryService = jasmine.createSpyObj('SentryService', ['captureException', 'captureBreadcrumb']);
    sentryErrorHandler = new SentryErrorHandler(sentryService);
  });

  describe('captureException', () => {
    it('calls captureException on SentryService when given a plain error object', () => {
      const error = new Error('some error');
      sentryErrorHandler.handleError(error);
      expect(sentryService.captureException).toHaveBeenCalledWith(error);
    });
    it('calls captureException on SentryService when given a error object with a nested error', () => {
      const nestedError = new Error('some error');
      const error = { originalError: nestedError };
      sentryErrorHandler.handleError(error);
      expect(sentryService.captureException).toHaveBeenCalledWith(nestedError);
    });
  });
});
