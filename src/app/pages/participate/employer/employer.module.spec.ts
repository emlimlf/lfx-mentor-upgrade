// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { EmployerModule } from './employer.module';

describe('EmployerModule', () => {
  let employerModule: EmployerModule;

  beforeEach(() => {
    employerModule = new EmployerModule();
  });

  it('should create an instance', () => {
    expect(employerModule).toBeTruthy();
  });
});
