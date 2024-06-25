// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sticky-tab',
  templateUrl: './sticky-tab.component.html',
  styleUrls: ['./sticky-tab.component.scss'],
})
export class StickyTabComponent implements OnInit {
  @Input() label = '';
  @Input() link?: string;
  @HostBinding('class') class = 'col-12';
  @HostBinding('class.active') active = false;
  @HostBinding('attr.role') role = 'tabpanel';

  constructor(public element: ElementRef) {}

  ngOnInit() {}
}
