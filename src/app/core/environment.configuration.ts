// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { InjectionToken } from '@angular/core';

export const ENVIRONMENT_KEY = new InjectionToken<EnvironmentConfiguration>('environment');

export class EnvironmentConfiguration {
  public constructor(public readonly stage: string, public readonly commit: string) {}
}

export const API_KEY = new InjectionToken<string>('api');
export const VULNERABILITY_KEY = new InjectionToken<string>('vulnerabilityUrl');
