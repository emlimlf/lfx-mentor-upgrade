// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Inject, Injectable, InjectionToken } from '@angular/core';
import * as Raven from 'raven-js';
import { ENVIRONMENT_KEY, EnvironmentConfiguration } from './environment.configuration';

export class SentryConfiguration {
  public constructor(public readonly dsn: string, public readonly enabled: boolean) {}
}

export const SENTRY_CONFIG_KEY = new InjectionToken<SentryConfiguration>('sentry');

@Injectable()
export class SentryService {
  private readonly enabled: boolean;

  constructor(
    @Inject(SENTRY_CONFIG_KEY) configuration: SentryConfiguration,
    @Inject(ENVIRONMENT_KEY) environment: EnvironmentConfiguration
  ) {
    this.enabled = configuration.enabled;
    if (!this.enabled) {
      return;
    }
    Raven.config(configuration.dsn, {
      environment: environment.stage,
      release: environment.commit
    }).install();
  }

  captureException(ex: string | Error | ErrorEvent) {
    if (!this.enabled) {
      return;
    }
    Raven.captureException(ex);
  }

  captureBreadcrumb(breadcrumb: Raven.Breadcrumb) {
    if (!this.enabled) {
      return;
    }
    Raven.captureBreadcrumb(breadcrumb);
  }
}
