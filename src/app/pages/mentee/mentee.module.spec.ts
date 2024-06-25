// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { MenteeModule } from './mentee.module';

describe('MenteeModule', () => {
  let menteeModule: MenteeModule;

  beforeEach(() => {
    menteeModule = new MenteeModule();
  });

  it('should create an instance', () => {
    expect(menteeModule).toBeTruthy();
  });
});
