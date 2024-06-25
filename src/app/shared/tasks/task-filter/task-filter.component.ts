// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

export interface TaskFilterToggleEvent {
  delta: number;
  label: string;
  options: string[];
}

export interface TaskFilter {
  label: string;
  options: string[];
  type: TaskFilterType;
  exclusive?: boolean;
  defaultOpt?: string;
}

type TaskFilterType = 'project' | 'task';

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.component.html',
  styleUrls: ['./task-filter.component.scss'],
})
export class TaskFilterComponent implements OnInit {
  @Input() filter!: TaskFilter;
  @Input() disabled = true;

  @Output() toggleFilter = new EventEmitter<TaskFilter>();
  @Output() toggledFilter = new EventEmitter<TaskFilterToggleEvent>();

  @ViewChild('arrow') arrow!: ElementRef<HTMLButtonElement>;
  @ViewChild(NgbDropdown) dropdown!: NgbDropdown;

  toggled = false;
  selected!: { [option: string]: boolean };

  ngOnInit() {
    const { options, exclusive, defaultOpt } = this.filter;
    this.selected = options.reduce(
      (obj, option) => ({
        ...obj,
        [option]: (!exclusive && option.toLowerCase() === 'all') || (exclusive && option === defaultOpt),
      }),
      {}
    );
    console.log(this.selected);
  }

  onToggleFilter() {
    const { dropdown } = this;

    if (dropdown.isOpen()) {
      dropdown.close();
    } else {
      dropdown.open();
      this.toggleFilter.emit(this.filter);
    }

    this.arrow.nativeElement.focus();
  }

  onToggledFilter(option: string) {
    const { label, exclusive } = this.filter;
    const delta = 1 - +this.selected[option] * 2;

    if (label === 'Sorting Order' || label === 'Group By') {
      this.filter.options.forEach(opt => (this.selected[opt] = !this.selected[opt]));
    } else {
      this.selected[option] = !this.selected[option];
      if (exclusive) {
        Object.keys(this.selected)
          .filter(key => key !== option)
          .forEach(key => (this.selected[key] = false));
      } else {
        let containAll = this.filter.options.find(res => {
          return res.toLowerCase() === 'all';
        });
        if (option.toLowerCase() === 'all') {
          Object.keys(this.selected)
            .filter(key => key !== option)
            .forEach(key => (this.selected[key] = false));
        } else if (containAll) {
          this.selected['All'] = false;
        }
      }
    }

    this.toggledFilter.emit({ label, options: this.getToggledOptions(), delta });
  }

  close() {
    this.dropdown.close();
    this.arrow.nativeElement.blur();
  }

  private getToggledOptions(): string[] {
    return Object.keys(this.selected).reduce(
      (all, option) => (this.selected[option] ? [...all, option] : all),
      [] as string[]
    );
  }
}
