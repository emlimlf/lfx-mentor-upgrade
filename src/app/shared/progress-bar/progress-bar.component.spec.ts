// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { CentsToDollarsPipe } from '@app/shared/cents-to-dollars.pipe';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressBarComponent, CentsToDollarsPipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });

  describe('getPercentage', () => {
    it('should calculate the progress percentage', () => {
      component.currentValue = 20;
      component.totalValue = 100;
      expect(component.getPercentageString()).toEqual('20%');
    });

    it('should return 100% if the percentage is more than 100%', () => {
      component.currentValue = 120;
      component.totalValue = 100;
      expect(component.getPercentageString()).toEqual('100%');
    });
  });
});
