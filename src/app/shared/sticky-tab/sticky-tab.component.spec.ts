// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyTabComponent } from './sticky-tab.component';

describe('StickyTabComponent', () => {
  let component: StickyTabComponent;
  let fixture: ComponentFixture<StickyTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StickyTabComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
