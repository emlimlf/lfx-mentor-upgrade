// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() avatarUrl: any = '';
  @Input() altName = '';
  @Input() rounded = false;
  @Input() xLarge = false;
  @Input() large = false;
  @Input() medium = false;
  @Input() small = false;
  @Input() xSmall = false;
  @Input() borderStyle = '';

  constructor(private downloadService: DownloadService) {}
  ngOnInit(): void {
    this.avatarUrl = this.avatarUrl === '' ? this.downloadService.defaultLogo : this.avatarUrl;
  }

  avatarLoaded = false;

  onLoadAvatar() {
    this.avatarLoaded = true;
  }
}
