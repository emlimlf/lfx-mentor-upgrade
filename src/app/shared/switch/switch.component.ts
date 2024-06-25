// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit {
  @Input() controlName = '';
  @Input() toggleOnDescription = 'Toggle On';
  @Input() toggleOffDescription = 'Toggle Off';
  @Input() formGroup!: FormGroup;

  control!: AbstractControl;

  constructor() {}

  ngOnInit() {
    const control = this.formGroup.get(this.controlName);
    if (control === null) {
      throw new Error('Control undefined');
    }
    this.control = control;
  }
}
