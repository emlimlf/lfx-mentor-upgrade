// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { MaintainerModule } from './maintainer.module';

describe('MaintainerModule', () => {
  let maintainerModule: MaintainerModule;

  beforeEach(() => {
    maintainerModule = new MaintainerModule();
  });

  it('should create an instance', () => {
    expect(maintainerModule).toBeTruthy();
  });
});
