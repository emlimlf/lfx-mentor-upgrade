// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ProfileModule } from './profile.module';

describe('ProfileModule', () => {
  let profileModule: ProfileModule;

  beforeEach(() => {
    profileModule = new ProfileModule();
  });

  it('should create an instance', () => {
    expect(profileModule).toBeTruthy();
  });
});
