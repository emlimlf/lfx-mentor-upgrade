// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationToggleComponent } from './navigation-toggle.component';

describe('NavigationToggleComponent', () => {
  let component: NavigationToggleComponent;
  let fixture: ComponentFixture<NavigationToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavigationToggleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
