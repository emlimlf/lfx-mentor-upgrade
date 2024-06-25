// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tally-item',
  templateUrl: './tally-item.component.html',
  styleUrls: ['./tally-item.component.scss']
})
export class TallyItemComponent implements OnInit {
  @Input() label = '';
  @Input() amount = 0;
  @Input() enabled = true;

  constructor() {}

  ngOnInit() {}
}
