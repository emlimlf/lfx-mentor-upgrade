// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component, Input, Optional, Host, SkipSelf, OnInit, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, ControlContainer, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { filterColor } from '@app/core/utilities/filter-color';

@Component({
  selector: 'app-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // required to by pass tslint here
      // tslint:disable-next-line: no-forward-ref
      useExisting: forwardRef(() => ColorInputComponent),
      multi: true,
    },
  ],
})
export class ColorInputComponent implements ControlValueAccessor, OnInit {
  @ViewChild('inputElement', { static: true }) inputElement: ElementRef | null = null;
  @Input() formControlName = '';
  @Input() label = 'label';
  inputValue = '';
  control: FormControl = new FormControl();

  minColorLength = 6;
  toggleColorPicker: any;

  constructor(
    @Optional()
    @Host()
    @SkipSelf()
    private controlContainer: ControlContainer,
    private el: ElementRef
  ) {}

  ngOnInit() {
    if (this.controlContainer && this.controlContainer.control) {
      this.control = this.controlContainer.control.get(this.formControlName) as FormControl;
    }
  }

  onKeyup(value: string) {
    const oldValue = this.inputValue;
    const newValue = filterColor(value) || '';

    if (this.inputElement) {
      this.inputElement.nativeElement.value = newValue;
    }

    if (oldValue === newValue) {
      return;
    }

    this.inputValue = newValue;
    this.propagateChanges(this.inputValue);
  }

  get colorPreview() {
    return this.control && this.control.value;
  }

  propagateChanges = (args: any) => null;

  writeValue(value: string): void {
    this.inputValue = value || '';
  }
  registerOnChange(fn: any): void {
    this.propagateChanges = fn;
  }
  // onbluronTouch doesn't required to implement
  registerOnTouched(fn: any): void {}
}
