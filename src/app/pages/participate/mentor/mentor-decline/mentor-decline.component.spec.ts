// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MentorDeclineComponent } from './mentor-decline.component';

describe('MentorDeclineComponent', () => {
  let component: MentorDeclineComponent;
  let fixture: ComponentFixture<MentorDeclineComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MentorDeclineComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MentorDeclineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
