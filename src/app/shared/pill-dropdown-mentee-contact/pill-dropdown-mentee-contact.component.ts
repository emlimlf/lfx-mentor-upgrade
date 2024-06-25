// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-pill-dropdown-mentee-contact',
  templateUrl: './pill-dropdown-mentee-contact.component.html',
  styleUrls: ['./pill-dropdown-mentee-contact.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class PillDropdownMenteeContactComponent implements OnInit, OnChanges {
  @Input() phone = 'n/a';
  @Input() email = 'n/a';

  options = [
    {
      class: 'fa fa-phone',
      protocol: 'tel:',
      title: 'call',
      value: this.phone,
    },
    {
      class: 'fa fa-inbox',
      protocol: 'mailto:',
      title: 'email',
      value: this.email,
    },
  ];
  optionsVisible = false;

  constructor() {}

  ngOnInit() {
    this.options[0].value = this.phone;
    this.options[1].value = this.email;
  }

  ngOnChanges() {
    this.optionsVisible = false;
  }

  toggle() {
    this.optionsVisible = !this.optionsVisible;
  }

  optionClickHandler(target: string) {
    console.log(target);
    location.href = target;
  }

  onClick(event: Event) {
    event.stopImmediatePropagation();
    if (event && !(event.target as HTMLElement).className.includes('fa-chevron')) {
      this.optionsVisible = false;
    }
  }
}
