// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit
  } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnChanges {
  @Input() color = '#CCCCCC';
  @Input() isLarge = true;
  @Input() isPending = false;
  @Input() isRejected = false;

  @HostBinding('style.background-color') backgroundColorStyle = '';
  @HostBinding('class.large-banner') largeBannerClass = false;
  @HostBinding('class.small-banner') smallBannerClass = false;

  constructor() {}

  ngOnInit() {
    this.backgroundColorStyle = this.color;
    this.largeBannerClass = this.isLarge;
    this.smallBannerClass = !this.isLarge;
  }

  ngOnChanges() {
    this.backgroundColorStyle = `#${this.color}`;
    this.largeBannerClass = this.isLarge;
    this.smallBannerClass = !this.isLarge;
  }
}
