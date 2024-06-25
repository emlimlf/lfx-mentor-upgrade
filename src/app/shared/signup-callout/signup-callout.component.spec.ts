// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { SignupCalloutComponent } from './signup-callout.component';

describe('SignupCalloutComponent', () => {
  let component: SignupCalloutComponent;
  let fixture: ComponentFixture<SignupCalloutComponent>;
  let store: Store<any>;
  beforeEach(async(() => {
    store = {
      dispatch: jasmine.createSpy('dispatch')
    } as any;

    TestBed.configureTestingModule({
      declarations: [SignupCalloutComponent],
      providers: [{ provide: Store, useValue: store }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupCalloutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
