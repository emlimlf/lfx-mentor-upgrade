// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GoAction, PROJECT_CREATE_ROUTE } from '@app/core';
import { Store } from '@ngrx/store';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let store: Store<any>;

  beforeEach(async(() => {
    store = jasmine.createSpyObj('Store', ['dispatch']);
    TestBed.configureTestingModule({
      declarations: [LandingComponent],
      providers: [{ provide: Store, useValue: store }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onCreateProject', () => {
    it('should redirect to PROJECT_CREATE_ROUTE', () => {
      component.onCreateProject();
      expect(store.dispatch).toHaveBeenCalledWith(new GoAction([PROJECT_CREATE_ROUTE]));
    });
  });
});
