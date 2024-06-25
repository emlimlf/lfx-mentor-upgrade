// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() filters: any[] = [];
  @Input() title = '';
  @Input() value = '';
  @Input() state = '';
  @Input() projectId: any;
  @Input() isAdmin: any;
  @Input() hasMentees: any;
  @Output() filterChanged = new EventEmitter<any>();
  @Output() sendMail = new EventEmitter<any>();
  @Output() exportMentees = new EventEmitter<any>();
  @ViewChild('dropdownInner', { static: true }) dropdown: any;

  constructor() {}

  ngOnInit() {}

  exportClicked() {
    const el = this.dropdown as ElementRef;
    const elVal = el.nativeElement.innerText;
    switch (elVal) {
      case 'Filter by Status':
        this.exportMentees.emit('all');
        break;
      default:
        this.exportMentees.emit('filtered');
        break;
    }
  }
  mailClicked() {
    const el = this.dropdown as ElementRef;
    const elVal = el.nativeElement.innerText;
    switch (elVal) {
      case 'Filter by Status':
        this.sendMail.emit('all');
        break;
      default:
        this.sendMail.emit('filtered');
        break;
    }
  }
  applyFilter(filter: any, value: string) {
    this.filterChanged.emit({
      filter,
      field: filter.field,
      value: value,
      state: this.state,
    });
  }
}
