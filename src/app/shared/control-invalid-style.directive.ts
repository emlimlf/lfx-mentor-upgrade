// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Directive, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appControlInvalidStyle]'
})
export class ControlInvalidStyleDirective implements OnInit {
  @Input('appControlInvalidStyle') appControlInvalidStyle?: AbstractControl;

  @HostBinding('class.is-invalid') isInvalid = false;
  @HostBinding('attr.aria-invalid') ariaInvalid = false;

  constructor() {}

  ngOnInit() {
    if (this.appControlInvalidStyle === undefined) {
      return;
    }
    this.updateInvalidStatus();

    this.appControlInvalidStyle.statusChanges.subscribe(showError => {
      this.updateInvalidStatus();
    });
  }

  @HostListener('blur')
  onFocus() {
    // The formControl.statusChanges observable doesn't emit an event when the 'touched' status changes, so we listen to the blur
    // event on the host component instead.
    this.updateInvalidStatus();
  }

  private updateInvalidStatus() {
    if (!this.appControlInvalidStyle) {
      this.isInvalid = false;
      this.ariaInvalid = false;
      return;
    }
    this.isInvalid = this.appControlInvalidStyle.invalid && this.appControlInvalidStyle.touched;
    this.ariaInvalid = this.isInvalid;
  }
}
