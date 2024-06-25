// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonComponent } from './radio-button.component';

@Component({
  template: `<app-radio-button [parentForm]='form' value="some-item" controlName="control" inputId="some-item"> </app-radio-button>`
})
class TestHostComponent {
  @ViewChild(RadioButtonComponent) item!: RadioButtonComponent;

  control = new FormControl('');
  form = new FormGroup({
    control: this.control
  });

  constructor() {}
}

describe('RadioButtonComponent', () => {
  let component: RadioButtonComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RadioButtonComponent, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
