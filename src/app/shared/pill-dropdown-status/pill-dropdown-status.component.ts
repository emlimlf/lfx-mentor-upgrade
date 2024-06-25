// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnChanges, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProjectMemberStatusArray } from '../../models/project.model';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-pill-dropdown-status',
  templateUrl: './pill-dropdown-status.component.html',
  styleUrls: ['./pill-dropdown-status.component.scss'],
})
export class PillDropdownStatusComponent implements OnInit, OnChanges, OnDestroy {
  @Input() value = '';
  @Input() readonly: any = false;
  @Output() changed = new EventEmitter<string>();
  documentClick$ = new Subscription();

  styles = {
    color: '',
    backgroundColor: '',
  };

  showOptions = true;
  options = ProjectMemberStatusArray;
  optionsVisible = false;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    if (typeof this.readonly === 'string') {
      this.readonly = this.readonly.toLowerCase() === 'true';
    }

    this.value = (this.value || 'n/a').toLowerCase();

    switch (this.value) {
      case 'new':
      case 'pending':
        this.styles.backgroundColor = '#387B90';
        this.styles.color = 'white';
        break;
      case 'hold':
      case 'on hold':
        this.styles.backgroundColor = '#F7D752';
        this.styles.color = '#666';
        break;
      case 'accepted':
      case 'approved':
      case 'graduated':
        this.styles.backgroundColor = '#5CB265';
        this.styles.color = 'white';
        break;
      case 'declined':
      case 'withdrawn':
        this.styles.backgroundColor = '#DCF2FB';
        this.styles.color = '#666';
        break;
      case 'rejected':
        this.styles.backgroundColor = '#BC534E';
        this.styles.color = 'white';
        break;
      default:
        this.styles.backgroundColor = 'black';
        this.styles.color = 'white';
        break;
    }

    if (this.readonly) {
      this.showOptions = false;
    }

    this.optionsVisible = false;
  }

  toggle() {
    if (!this.showOptions) {
      return;
    }
    if (!this.optionsVisible) {
      this.documentClick$ = fromEvent(document, 'click', { passive: true }).subscribe(event => {
        event.stopImmediatePropagation();
        if (event && !(event.target as HTMLElement).className.includes('fa-chevron')) {
          this.optionsVisible = false;
          this.documentClick$.unsubscribe();
          return;
        }
      });
    }
    this.optionsVisible = !this.optionsVisible;
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
