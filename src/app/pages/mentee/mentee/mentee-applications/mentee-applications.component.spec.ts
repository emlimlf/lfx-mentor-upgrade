// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenteeApplicationsComponent } from './mentee-applications.component';

describe('MenteeApplicationsComponent', () => {
  let component: MenteeApplicationsComponent;
  let fixture: ComponentFixture<MenteeApplicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenteeApplicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenteeApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
