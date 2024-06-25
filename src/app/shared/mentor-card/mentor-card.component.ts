// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DownloadService } from '@app/services/download.service';
import { UserService } from '@app/services/user.service';

interface MentorCard {
  id: string;
  topHeaderStyle: { [styleProp: string]: string };
  avatarUrl: string;
  title: string;
  description: string;
  skillTags: string[];
  graduates: { name: string; avatar: string }[];
  projects: { logoUrl: string }[];
  apprentices: { name: string; avatar: string }[];
  subcardShown: 'projects' | 'skills' | 'description' | 'apprentices' | 'graduates' | null;
}

@Component({
  selector: 'app-mentor-card',
  templateUrl: './mentor-card.component.html',
  styleUrls: ['../editable-card/editable-card.scss', './mentor-card.component.scss'],
})
export class MentorCardComponent implements OnInit {
  @Input() mentorCard: MentorCard = {} as any;
  @Input() editProfile = false;
  @Output() edit = new EventEmitter<MentorCard>();
  activePopover: any;

  constructor(private router: Router, private downloadService: DownloadService, private userService: UserService) {}

  ngOnInit() {
    this.mentorCard.title =
      this.mentorCard.title.length >= 153 ? this.mentorCard.title.slice(0, 153).concat('...') : this.mentorCard.title;

    if (!this.mentorCard.avatarUrl || (this.mentorCard.avatarUrl as string).includes('s.gravatar')) {
      this.mentorCard.avatarUrl = this.downloadService._defaultLogo({
        first: this.mentorCard.title,
        last: '',
      });
    }

    this.mentorCard.avatarUrl = encodeURI(this.mentorCard.avatarUrl);

    if (this.mentorCard.graduates) {
      this.mentorCard.graduates = this.uniqueApprentices(this.mentorCard.graduates);
      this.mentorCard.graduates.forEach(graduate => {
        if ((graduate.avatar && (graduate.avatar as string).includes('s.gravatar')) || !graduate.avatar) {
          graduate.avatar = this.downloadService._defaultLogo({ first: graduate.name, last: '' });
        }
      });
    }

    if (this.mentorCard.apprentices) {
      this.mentorCard.apprentices = this.uniqueApprentices(this.mentorCard.apprentices);
      this.mentorCard.apprentices.forEach(apprentice => {
        if ((apprentice.avatar && (apprentice.avatar as string).includes('s.gravatar')) || !apprentice.avatar) {
          apprentice.avatar = this.downloadService._defaultLogo({ first: apprentice.name, last: '' });
        }
      });
    }
  }

  onClickMentorProfile(mentorCard: MentorCard) {
    this.router.navigate(['mentor/' + mentorCard.id]);
  }

  onEdit() {
    this.userService.isClickAction$.next(true);
    this.edit.emit(this.mentorCard);
  }

  // Get unique apprentice by avatarUrl.
  uniqueApprentices = (arr: any) => {
    return arr.filter((v: any, i: number) => arr.findIndex((apprentice: any) => apprentice.avatar === v.avatar) === i);
  };

  openPopover(popover: any) {
    this.activePopover = popover;
    if (this.activePopover && !this.activePopover.isOpen()) {
      this.activePopover.open();
    }
  }

  closePopover() {
    if (this.activePopover && this.activePopover.isOpen()) {
      this.activePopover.close();
    }
  }
}
