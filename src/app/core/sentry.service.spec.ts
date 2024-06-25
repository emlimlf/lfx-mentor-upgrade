// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { inject, TestBed } from '@angular/core/testing';
import { ENVIRONMENT_KEY, EnvironmentConfiguration } from './environment.configuration';
import { SENTRY_CONFIG_KEY, SentryConfiguration, SentryService } from './sentry.service';

describe('SentryService', () => {
  const environment: EnvironmentConfiguration = {
    commit: '123abc',
    stage: 'production'
  };

  const sentry: SentryConfiguration = {
    dsn: '12345',
    enabled: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SentryService,
        { provide: ENVIRONMENT_KEY, useValue: environment },
        { provide: SENTRY_CONFIG_KEY, useValue: sentry }
      ]
    });
  });

  it(
    'should be created',
    inject([SentryService], (service: SentryService) => {
      expect(service).toBeTruthy();
    })
  );
});
