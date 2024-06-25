// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ParticipateModule } from './participate.module';

describe('ParticipateModule', () => {
  let participateModule: ParticipateModule;

  beforeEach(() => {
    participateModule = new ParticipateModule();
  });

  it('should create an instance', () => {
    expect(participateModule).toBeTruthy();
  });
});
