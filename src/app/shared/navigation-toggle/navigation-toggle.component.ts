// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation-toggle',
  templateUrl: './navigation-toggle.component.html',
  styleUrls: ['./navigation-toggle.component.scss']
})
export class NavigationToggleComponent implements OnInit {
  @Input() ariaControls = '';

  @Input() isCollapsed = true;
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  onCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
}
