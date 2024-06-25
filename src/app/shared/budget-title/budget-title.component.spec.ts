// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetTitleComponent } from './budget-title.component';

describe('BudgetTitleComponent', () => {
  let component: BudgetTitleComponent;
  let fixture: ComponentFixture<BudgetTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BudgetTitleComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
