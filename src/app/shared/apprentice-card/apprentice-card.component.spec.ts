// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApprenticeCardComponent } from './apprentice-card.component';

describe('ApprenticeCardComponent', () => {
  let component: ApprenticeCardComponent;
  let fixture: ComponentFixture<ApprenticeCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ApprenticeCardComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprenticeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
