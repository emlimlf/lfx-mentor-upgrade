// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryIconsComponent } from './industry-icons.component';

describe('IndustryIconsComponent', () => {
  let component: IndustryIconsComponent;
  let fixture: ComponentFixture<IndustryIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IndustryIconsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustryIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
