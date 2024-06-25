// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FormErrorComponent } from './form-error.component';

@Component({
  template: `
    <app-form-error [control]="control">
    </app-form-error>`
})
class TestHostComponent {
  readonly control: FormControl;

  constructor() {
    this.control = new FormControl();
  }
}

describe('FormErrorComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormErrorComponent, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
