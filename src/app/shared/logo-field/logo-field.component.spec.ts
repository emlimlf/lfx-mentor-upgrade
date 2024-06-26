// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedModule } from '@app/shared';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  template: `
    <app-logo-field [parent]="group" [control]="'logo'"> </app-logo-field>
  `,
})
class TestHostComponent {
  readonly group: FormGroup;

  constructor() {
    this.group = new FormGroup({});
    this.group.addControl('logo', new FormControl());
  }
}

describe('LogoFieldComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, ReactiveFormsModule],
        declarations: [TestHostComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
