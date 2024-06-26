// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MentorComponent } from './mentor.component';

describe('MentorComponent', () => {
  let component: MentorComponent;
  let fixture: ComponentFixture<MentorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MentorComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MentorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
