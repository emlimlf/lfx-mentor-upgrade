// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnChanges } from '@angular/core';

const BAR_COLOR_EMPTY = '#f3f4f4';

@Component({
  selector: 'app-progress-bar-card',
  templateUrl: './progress-bar-card.component.html',
  styleUrls: ['./progress-bar-card.component.scss']
})
export class ProgressBarCardComponent implements OnChanges {
  percentageString = '';
  breakpointPosition = '';
  startValue = 0;
  _total = 0;
  _goal = 1;
  _color = BAR_COLOR_EMPTY;
  barColor = BAR_COLOR_EMPTY;
  interval: any;

  @Input() type = '';

  @Input() set color (value: string) {
    if (value) {
      if (value.includes('rgb') || value.includes('#')) {
        this._color = value;
      } else if (!value.includes('#')) {
        this._color = '#' + value;
      }
    }
  }
  get color () {
    return this._color;
  }
  @Input() set step (value) {
    this._goal = value || 1;
  }
  get step () {
    return this._goal;
  }
  @Input() animate = false;
  @Input() set totalFunding (value: number) {
    this._total = value || 0;
  }

  get totalFunding () {
    return this._total;
  }

  ngOnChanges() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.animateProgressBar();
  }
  animateProgressBar() {
    if (!this.animate) {
      const point = this.totalFunding / this.step;
      this.setTemplateValues(point);
      return;
    }

    let circlePosition = 0;
    let barAccumulated = 0;
    const costPerMentee = this.step;
    const total = this.totalFunding;
    const totalMenteesFundNumber = Math.floor(total / costPerMentee);
    const totalMenteesFundAmount = totalMenteesFundNumber * costPerMentee;
    const speedOnBars = totalMenteesFundAmount / 33; // approx 2s
    const speedOnLastBar = (total - totalMenteesFundAmount) / 8; // approx .5s

    this.interval = setInterval(() => {
      barAccumulated += barAccumulated < totalMenteesFundAmount ? speedOnBars : speedOnLastBar;
      circlePosition = barAccumulated / costPerMentee;
      this.setTemplateValues(circlePosition);

      if (barAccumulated >= this.totalFunding) {
        clearInterval(this.interval);
      }
    }, 60);
  }

  setTemplateValues(dynamicPoint: number) {
    const width = Math.floor((dynamicPoint * 100) % 100);
    const startValue = Math.floor(dynamicPoint);
    
    this.startValue = Number.isFinite(startValue) ? startValue : 0;
    this.percentageString = this.getPercentageString(width);
    this.breakpointPosition = this.getBreakPointPosition(width);
    this.setProjectColorIfAMenteeIsFullFounded();
  }

  setProjectColorIfAMenteeIsFullFounded() {
    if (this.startValue) {
      this.barColor = this.color;
    }
  }
  getPercentageString(stripedWidth: number) {
    return `${Math.floor(stripedWidth)}%`;
  }
  getBreakPointPosition(stripedWidth: number) {
    const min = this.type === 'large' ? 5 : 15;
    return stripedWidth > min ? `${stripedWidth}%` : `${min}%`;
  }
}
