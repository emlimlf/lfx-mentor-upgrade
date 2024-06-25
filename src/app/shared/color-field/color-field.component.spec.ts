// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@app/shared';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  template: `<app-color-field [parent]="group" [control]="'color'">
    </app-color-field>`
})
class TestHostComponent {
  readonly group: FormGroup;

  constructor() {
    this.group = new FormGroup({});
    this.group.addControl('color', new FormControl());
  }
}

describe('ColorFieldComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, ReactiveFormsModule],
      declarations: [TestHostComponent]
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

  it("shouldn't validate hex codes less than 6 characters", () => {
    component.group.controls['color'].setValue('FF0');
    component.group.updateValueAndValidity();
    expect(component.group.valid).toBeFalsy();
  });

  it("shouldn't allow input of hex codes with invalid characters", () => {
    component.group.controls['color'].setValue('fFZ0#');
    component.group.updateValueAndValidity();
    expect(component.group.controls['color'].value).toEqual('FF0');
  });

  it("shouldn't allow input of hex codes longer than 6 characters", () => {
    component.group.controls['color'].setValue('FF00FF0');
    component.group.updateValueAndValidity();
    expect(component.group.controls['color'].value).toEqual('FF00FF');
  });
});
