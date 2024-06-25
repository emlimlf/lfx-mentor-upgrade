// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.scss']
})
export class OverviewCardComponent implements OnInit {
  @Input() title = '';
  @Input() backgroundColor = '#FFFFFF';

  @HostBinding('class') class = '';
  @Input() large = false;

  constructor() {}

  ngOnInit() {
    this.class = this.large ? 'col px-0 px-md-2 px-xl-3 py-2 py-xl-3' : 'col px-0 px-md-2 px-xl-3 py-2 py-xl-3';
  }
}
