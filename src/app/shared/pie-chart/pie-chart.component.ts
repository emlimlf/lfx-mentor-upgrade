// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input } from '@angular/core';
import { describeArc, PieItem, Icon, CenterText } from '@app/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
  @Input() title = '';
  @Input() strokeWidth = 0;
  @Input() sideLength = 0;
  @Input() sections: PieItem[] = [];
  @Input() icon: Icon = { src: '', width: 0 };
  @Input() centerText: CenterText = { title: '', amount: 0 };

  constructor() {}

  describeArc(x: number, y: number, startAngle: number, endAngle: number) {
    return describeArc(x, y, (this.sideLength + this.strokeWidth) / 2, startAngle, endAngle);
  }

  trackSection(index: number, item: PieItem) {
    return index;
  }

  mapViewBox() {
    const width = this.sideLength + this.strokeWidth * 2;
    const height = width;
    const startX = -width / 2;
    const startY = -height / 2;
    return startX + ', ' + startY + ', ' + width + ', ' + height;
  }
}
