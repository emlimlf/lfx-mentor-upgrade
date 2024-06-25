// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ProjectModule } from './project.module';

describe('ProjectModule', () => {
  let projectModule: ProjectModule;

  beforeEach(() => {
    projectModule = new ProjectModule();
  });

  it('should create an instance', () => {
    expect(projectModule).toBeTruthy();
  });
});
