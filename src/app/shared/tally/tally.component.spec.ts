// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TallyItemComponent } from '../tally-item/tally-item.component';
import { TallyComponent } from './tally.component';

@Component({
  selector: 'app-test-component',
  template: `
  <app-tally>
    <app-tally-item label="1" [amount]="1" [enabled]="enabled1"> </app-tally-item>
    <app-tally-item label="2" [amount]="2" [enabled]="enabled2"> </app-tally-item>
    <app-tally-item label="3" [amount]="3" [enabled]="enabled3"> </app-tally-item>
  </app-tally>
  `
})
class TestHostComponent {
  enabled1 = true;
  enabled2 = true;
  enabled3 = true;
}

describe('TallyComponent', () => {
  let component: TallyComponent;
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TallyComponent, TallyItemComponent, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(TallyComponent)).componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calulate the correct tally', () => {
    expect(component.totalAmount).toEqual(6);
  });

  it('should not include disabled tally items in total tally', () => {
    testHost.enabled1 = false;
    fixture.detectChanges();
    expect(component.totalAmount).toEqual(5);
  });
});
