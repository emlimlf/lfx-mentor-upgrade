// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { filterColor } from '@app/core/utilities/filter-color';

@Component({
  selector: 'app-color-field',
  templateUrl: './color-field.component.html',
  styleUrls: ['./color-field.component.scss']
})
export class ColorFieldComponent implements AfterViewInit, OnChanges {
  @Input() parent!: FormGroup;
  @Input() control = '';

  readonly minColorLength = 6;

  constructor() {}

  ngAfterViewInit() {
    this.ngOnChanges();
  }

  ngOnChanges() {
    const colorControl = this.colorControl;
    if (colorControl === null) {
      return;
    }

    colorControl.setValidators([Validators.minLength(this.minColorLength), Validators.required]);

    colorControl.valueChanges.subscribe(val => {
      const res = filterColor(val);
      colorControl.setValue(res, { emitEvent: false });
    });
  }

  get colorPreview() {
    const colorControl = this.colorControl;
    if (colorControl === null) {
      return;
    }
    return colorControl.value;
  }

  get colorControl() {
    return this.parent.get(this.control);
  }
}
