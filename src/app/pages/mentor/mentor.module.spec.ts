// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { MentorModule } from './mentor.module';

describe('MentorModule', () => {
  let mentorModule: MentorModule;

  beforeEach(() => {
    mentorModule = new MentorModule();
  });

  it('should create an instance', () => {
    expect(mentorModule).toBeTruthy();
  });
});
