// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ProjectMemberStatusArray } from '@app/models/project.model';

@Component({
  selector: 'app-status-dropdown',
  templateUrl: './status-dropdown.component.html',
  styleUrls: ['./status-dropdown.component.scss'],
})
export class StatusDropdownComponent implements OnInit {
  @Input() value = '';
  @Input() Id = '';
  @Input() readonly = false;
  @Output() changed = new EventEmitter<string>();
  documentClick$ = new Subscription();

  styles = {
    color: '',
    backgroundColor: '',
  };

  showOptions = true;
  options = ProjectMemberStatusArray.sort();
  optionsVisible = false;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.value = (this.value || 'n/a').toLowerCase();

    switch (this.value) {
      case 'new':
      case 'pending':
        this.styles.backgroundColor = '#FFAD5F';
        break;
      case 'hold':
      case 'on hold':
        this.styles.backgroundColor = '#F7D752';
        break;
      case 'accepted':
      case 'approved':
        this.styles.backgroundColor = '#A1D683';
        break;
      case 'graduated':
        this.styles.backgroundColor = '#38ABA0';
        break;
      case 'declined':
      case 'withdrawn':
      case 'rejected':
        this.styles.backgroundColor = '#B5BDC9';
        break;
      default:
        this.styles.backgroundColor = '#B5BDC9';
        break;
    }

    this.showOptions = !this.readonly;

    this.optionsVisible = false;
  }

  toggle() {
    if (!this.showOptions) {
      return;
    }
    if (!this.optionsVisible) {
      this.documentClick$ = fromEvent(document, 'click', { passive: true }).subscribe(event => {
        event.stopImmediatePropagation();
        if (event && !(event.target as HTMLElement).className.includes(this.Id)) {
          this.optionsVisible = false;
          this.documentClick$.unsubscribe();
          return;
        }
      });
    }
    this.optionsVisible = !this.optionsVisible;
    if (!this.optionsVisible) {
      this.documentClick$.unsubscribe();
    }
  }

  select(option: string) {
    if (!this.showOptions) {
      return;
    }
    this.changed.emit(option);
    setTimeout(() => {
      // let change detection finish
      this.ngOnChanges();
    }, 1);
  }

  ngOnDestroy() {
    this.documentClick$.unsubscribe();
  }
}
