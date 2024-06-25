// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-budget-title',
  templateUrl: './budget-title.component.html',
  styleUrls: ['./budget-title.component.scss']
})
export class BudgetTitleComponent implements OnInit {
  @Input() title = '';
  @Input() color = '';
  @Input() value = '';
  @Input() smallText = false;
  @Input() xSmallText = false;
  @Input() percentage = '0%';

  constructor() {}

  ngOnInit() {}
}
