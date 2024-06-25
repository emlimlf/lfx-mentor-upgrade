// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillDropdownMenteeContactComponent } from './pill-dropdown-mentee-contact.component';

describe('PillDropdownMenteeContactComponent', () => {
  let component: PillDropdownMenteeContactComponent;
  let fixture: ComponentFixture<PillDropdownMenteeContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillDropdownMenteeContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillDropdownMenteeContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
