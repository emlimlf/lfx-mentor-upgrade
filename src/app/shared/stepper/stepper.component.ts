// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ContentChildren, Input, OnInit, QueryList } from '@angular/core';
import { StepperItemComponent } from '../stepper-item/stepper-item.component';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
  @ContentChildren(StepperItemComponent) steps!: QueryList<StepperItemComponent>;
  @Input() selectedStep = 0;

  constructor() {}

  ngOnInit() {}

  trackStep(index: number) {
    return index;
  }
}
