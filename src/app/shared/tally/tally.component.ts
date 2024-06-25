// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  Component,
  ContentChildren,
  OnInit,
  QueryList
  } from '@angular/core';
import { TallyItemComponent } from '../tally-item/tally-item.component';

export interface TallyItem {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-tally',
  templateUrl: './tally.component.html',
  styleUrls: ['./tally.component.scss']
})
export class TallyComponent implements OnInit {
  @ContentChildren(TallyItemComponent) items!: QueryList<TallyItemComponent>;

  get totalAmount() {
    return this.items.filter(item => item.enabled).reduce((total, next) => total + next.amount, 0);
  }

  constructor() {}

  ngOnInit() {}

  trackItem(index: number, _: TallyComponent) {
    return index;
  }
}
