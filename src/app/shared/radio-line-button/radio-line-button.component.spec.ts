// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioLineButtonComponent } from './radio-line-button.component';
import { RadioButtonComponent } from '../radio-button/radio-button.component';

@Component({
  template: `
    <app-radio-line-button [parentForm]="form" value="some-item" controlName="control" inputId="some-item">
    </app-radio-line-button>
  `,
})
class TestHostComponent {
  @ViewChild(RadioLineButtonComponent, { static: true }) item!: RadioLineButtonComponent;

  control = new FormControl('');
  form = new FormGroup({
    control: this.control,
  });

  constructor() {}
}

describe('RadioLineButtonComponent', () => {
  let component: RadioLineButtonComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [RadioLineButtonComponent, TestHostComponent, RadioButtonComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
