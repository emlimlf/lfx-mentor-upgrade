// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { EmployerCard } from '@app/models/employer.model';
import { EditableCard } from '@app/shared/editable-card/editable-card.directive';

@Component({
  selector: 'app-employer-card',
  templateUrl: './employer-card.component.html',
  styleUrls: ['../editable-card/editable-card.scss', './employer-card.component.scss'],
})
export class EmployerCardComponent implements OnInit, EditableCard {
  @Input() employerCard: EmployerCard = {} as any;
  @Output() edit = new EventEmitter<EmployerCard>();

  isEditable: boolean = false;
  employerCardHover: boolean = false;
  aParticipant: boolean = false;
  participationStatus: any;
  participations: any = [];
  basic = {
    active: false,
    preview: false,
  };
  description: any;
  participation: any;

  constructor() {
    this.description = this.participation = this.basic;
  }

  ngOnInit() {
    this.participations = this.employerCard.participation;

    const participationStatus = this.employerCard.participationStatus;
    if (participationStatus) {
      this.aParticipant =
        participationStatus.participatingHiring || participationStatus.participatingFunding ? true : false;
    }
  }

  onClickMoreParticipation(employerCard: EmployerCard, preview: boolean, active: boolean) {
    //  if (employerCard.participation && employerCard.participation.length > 0) {
    employerCard.subcardShown = 'participation';
    this.detectSubCardShown(employerCard.subcardShown, preview, active);
    this.description.preview = false;
    //  }
  }

  onClickMentorReadMore(employerCard: EmployerCard, preview: boolean, active: boolean) {
    // if (employerCard.description && employerCard.description.length > 0) {
    employerCard.subcardShown = 'description';
    this.detectSubCardShown(employerCard.subcardShown, preview, active);
    this.participation.preview = false;
    //}
  }

  showAvatar() {
    return (
      this.employerCard.logoUrl && this.employerCard.status !== 'pending' && this.employerCard.status !== 'rejected'
    );
  }

  onEdit() {
    this.edit.emit(this.employerCard);
  }

  showEditProfile() {
    this.employerCardHover = true;
  }

  hideEditProfile() {
    this.employerCardHover = false;
  }

  detectSubCardShown(element: string, preview: boolean, active: boolean) {
    switch (element) {
      case 'description': {
        this.description = { preview: preview, active: active };
        break;
      }
      case 'participation': {
        this.participation = { preview: preview, active: active };
        break;
      }
    }
    console.log(this.participation, this.description);
  }

  openPopUp(element: string, preview: boolean, active: boolean) {
    this.detectSubCardShown(element, preview, active);
  }
}
