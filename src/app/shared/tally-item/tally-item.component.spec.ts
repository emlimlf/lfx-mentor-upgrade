// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TallyItemComponent } from './tally-item.component';

describe('TallyItemComponent', () => {
  let component: TallyItemComponent;
  let fixture: ComponentFixture<TallyItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TallyItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TallyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
