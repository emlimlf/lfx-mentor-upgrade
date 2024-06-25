import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-sponsor',
  templateUrl: './sponsor.component.html',
  styleUrls: ['./sponsor.component.scss'],
})
export class SponsorComponent implements OnChanges {
  @Input() logoUrl = '/assets/no_logo_uploaded.svg';
  @Input() altName = '';
  @Input() defaultText = '';
  @Input() class = '';

  avatarLoaded = false;

  ngOnChanges() {
    if (!this.logoUrl) {
      this.logoUrl = '/assets/no_logo_uploaded.svg';
    }
  }

  onLoadAvatar() {
    if (this.logoUrl) {
      this.avatarLoaded = true;
    }
  }
}
