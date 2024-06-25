// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, Input } from '@angular/core';
import { Options } from 'ng5-slider';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @Input() parent!: FormGroup;
  @Input() control = '';
  @Input() currentValue = 0;
  @Input() min: number = 1;
  @Input() max: number = 10;
  @Input() step: number = 1;
  value: number = 1;
  options: Options = {
    floor: this.min,
    ceil: this.max,
    showTicksValues: true
  };

  constructor() {
   }

  ngOnInit() {
  }
}
