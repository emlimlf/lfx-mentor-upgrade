// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { BadgeType, Project, Badge } from '@app/core';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent implements OnInit {
  @Input() project!: Project;
  @Input() isSmall = false;
  badges: Badge[] = [];
  constructor() {}

  ngOnInit() {
    if (this.project !== undefined && this.project.badges !== undefined) {
      this.badges = this.project.badges;
    }
  }

  getBadgeIcon(type: BadgeType) {
    switch (type) {
      case BadgeType.SECURITY: {
        return '/assets/icons/security-badge.svg';
      }
      case BadgeType.APPRENTICE: {
        return '/assets/icons/apprentice-badge.svg';
      }
      case BadgeType.CII_GOLD: {
        return '/assets/icons/cii-gold.svg';
      }
      case BadgeType.CII_SILVER: {
        return '/assets/icons/cii-silver.svg';
      }
      case BadgeType.CII_PASSING: {
        return '/assets/icons/cii-passing.svg';
      }
    }
  }

  trackBadge(index: number, item: Badge) {
    return index;
  }
}
