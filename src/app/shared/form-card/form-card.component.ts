// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent implements OnInit, OnDestroy {
  @Input() heading = '';

  @Input() parent!: FormGroup;
  @Input() control = '';
  @Input() formGroupName = '';
  @Input() loading = false;
  @Input() category = '';

  sectionControl?: AbstractControl;
  subscription = new Subscription();
  formGroup: FormGroup = new FormGroup({});

  constructor() {}

  ngOnInit() {
    if (this.parent !== undefined) {
      this.sectionControl = this.parent.controls[this.control];
      this.formGroup = this.parent.controls[this.formGroupName] as FormGroup;
    }

    this.setUpdateControlsOnHide();
    this.setAllValidators();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setAllValidators() {
    Object.values(this.formGroup.controls).forEach(control => {
      if (control.validator !== null) {
        control.setValidators([control.validator, this.validateMaybeRequired()]);
      } else {
        control.setValidators(this.validateMaybeRequired());
      }
      control.updateValueAndValidity();
    });
  }

  setUpdateControlsOnHide() {
    if (this.sectionControl !== undefined) {
      // Update required state whenever we hide/show the form card so hidden controls don't prevent submission
      const onHideSubscription = this.sectionControl.valueChanges.subscribe(val => {
        Object.values(this.formGroup.controls).forEach(control => {
          control.updateValueAndValidity();
        });
      });

      this.subscription.add(onHideSubscription);
    }
  }

  validateMaybeRequired() {
    return (control: AbstractControl) => {
      if (!this.sectionEnabled) {
        return null;
      }

      return Validators.required(control);
    };
  }

  get sectionEnabled() {
    if (this.sectionControl === undefined) {
      return true;
    }
    return Boolean(this.sectionControl.value);
  }
}
