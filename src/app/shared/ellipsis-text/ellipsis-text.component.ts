// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component, Input } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-ellipsis-text',
  templateUrl: './ellipsis-text.component.html',
  styleUrls: ['./ellipsis-text.component.scss'],
})
export class EllipsisTextComponent {
  @Input() text = '';
  @Input() minHeight = '9.5rem';
  @Input() isHeading = false;
  @Input() preserveMinHeight = false;

  showFullText = false;
  showViewMoreBtn = false;
  minPreHeight = this.minHeight;
  uniqueId = uuidv4();

  moreClicked() {
    this.showFullText = !this.showFullText;
  }

  hideDescription() {
    this.showFullText = false;
  }

  onEllipsisChange(event: any) {
    setTimeout(() => {
      this.showViewMoreBtn = event === null ? false : true;
      if (event === null && !this.showFullText && !this.preserveMinHeight) {
        const parentEl = document.getElementById(this.uniqueId);
        if (parentEl) {
          const ellipsisEl = parentEl.firstChild as HTMLElement;
          if (ellipsisEl) {
            const height = ellipsisEl.offsetHeight / 16;
            this.minPreHeight = height + 'rem';
          }
        }
      } else if (this.minPreHeight !== this.minHeight) {
        this.minPreHeight = this.minHeight;
      }
    });
  }
}
