// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { ProjectOwnerGuard } from './project-owner.guard';

describe('ProjectOwnerGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectOwnerGuard],
    });
  });

  it('should ...', inject([ProjectOwnerGuard], (guard: ProjectOwnerGuard) => {
    expect(guard).toBeTruthy();
  }));
});
