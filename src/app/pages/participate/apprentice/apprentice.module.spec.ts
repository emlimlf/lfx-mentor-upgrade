// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ApprenticeModule } from './apprentice.module';

describe('ApprenticeModule', () => {
  let apprenticeModule: ApprenticeModule;

  beforeEach(() => {
    apprenticeModule = new ApprenticeModule();
  });

  it('should create an instance', () => {
    expect(apprenticeModule).toBeTruthy();
  });
});
