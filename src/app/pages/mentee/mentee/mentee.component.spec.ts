// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenteeComponent } from './mentee.component';

describe('MenteeComponent', () => {
  let component: MenteeComponent;
  let fixture: ComponentFixture<MenteeComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MenteeComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MenteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
