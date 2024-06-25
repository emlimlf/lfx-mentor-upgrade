// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-placeholder-card',
  templateUrl: './placeholder-card.component.html',
  styleUrls: ['./placeholder-card.component.scss']
})
export class PlaceholderCardComponent implements OnInit {
  @Input() height = '338';

  constructor() {}

  ngOnInit() {}
}
