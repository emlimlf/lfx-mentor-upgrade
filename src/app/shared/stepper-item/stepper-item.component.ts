// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stepper-item',
  templateUrl: './stepper-item.component.html',
  styleUrls: ['./stepper-item.component.scss']
})
export class StepperItemComponent implements OnInit {
  @Input() name = '';

  constructor() {}

  ngOnInit() {}
}
