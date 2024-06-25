// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillDropdownStatusComponent } from './pill-dropdown-status.component';

describe('PillDropdownStatusComponent', () => {
  let component: PillDropdownStatusComponent;
  let fixture: ComponentFixture<PillDropdownStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillDropdownStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillDropdownStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
