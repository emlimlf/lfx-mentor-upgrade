// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit, OnChanges {
  @Input() color = '#CCCCCC';
  @Input() currentValue = 0;
  @Input() totalValue = 0;
  @Input() isSmall = false;

  backgroundColorStyle = '';
  constructor() {}

  ngOnInit() {
  }

  ngOnChanges() {
    this.backgroundColorStyle = `#${this.color}`;
  }

  private getStripedWidth() {
    const factor = (this.currentValue / this.totalValue) * 100;
    if (this.currentValue >= this.totalValue) {
      return 100;
    }
    return factor;
  }

  getPercentageString() {
    return Math.floor(this.getStripedWidth()) + '%';
  }

  getBreakPointPosition() {
    if (this.getStripedWidth() >= 2) {
      return this.getStripedWidth() - 2 + '%';
    }
    return '0%';
  }
}
