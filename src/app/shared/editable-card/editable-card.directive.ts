// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Directive, EventEmitter, HostBinding, HostListener, Optional, OnInit, Host } from '@angular/core';
import { EmployerCardComponent } from '@app/shared/employer-card/employer-card.component';

export interface EditableCard {
  edit: EventEmitter<any>;
  isEditable: boolean;
  hideEditProfile(): void;
  showEditProfile(): void;
}

@Directive({
  selector: '[appEditableCard]',
})
export class EditableCardDirective implements OnInit {
  @HostBinding('class.apprentice-card') isApprenticeCard = false;
  @HostBinding('class.card') isCard = true;
  @HostBinding('class.mentor-card') isMentorCard = false;
  @HostBinding('class.employer-card') isEmployerCard = false;
  @HostBinding('class.for-profile') isForProfile = false;
  @HostBinding('class.mt-4plus') margin = true;

  card?: EditableCard;

  constructor(@Optional() @Host() employerCard: EmployerCardComponent) {
    if (employerCard) {
      this.isEmployerCard = true;
      this.card = employerCard;
    }
  }

  ngOnInit() {
    if (!this.card) {
      return;
    }

    this.card.isEditable = this.card.edit.observers.length > 0;
    this.isForProfile = this.card.isEditable;
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.card) {
      return;
    }

    this.card.showEditProfile();
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.card) {
      return;
    }

    this.card.hideEditProfile();
  }
}
