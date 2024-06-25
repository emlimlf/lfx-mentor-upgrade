// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Host, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-radio-line-button',
  templateUrl: './radio-line-button.component.html',
  styleUrls: ['./radio-line-button.component.scss']
})
export class RadioLineButtonComponent implements OnInit {
  @HostBinding('class.btn') btnClass = true;
  @HostBinding('class.btn-outline-blue') btnOutlineBlue = true;
  @HostBinding('class.selected') lineSelected = true;

  @Input() parentForm!: FormGroup;
  @Input() controlName = '';
  @Input() value = '';
  @Input() inputId = '';

  constructor() {}

  ngOnInit() {
    const control = this.parentForm.get(this.controlName);
    if (control === null) {
      return;
    }
    const selected$ = control.valueChanges.pipe(
      map(_ => control.value),
      startWith(control.value),
      map(value => value === this.value)
    );

    const sub = selected$.subscribe(selected => {
      this.lineSelected = selected;
    });
  }

  onClick() {
    const control = this.parentForm.get(this.controlName);
    if (control === null) {
      return;
    }
    control.setValue(this.value);
  }
}
