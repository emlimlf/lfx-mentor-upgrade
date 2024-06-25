// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnChanges } from '@angular/core';
import { OnInit } from '@angular/core';

const BAR_COLOR_EMPTY = '#f3f4f4';

@Component({
  selector: 'app-progress-bar-funding',
  templateUrl: './progress-bar-funding.component.html',
  styleUrls: ['./progress-bar-funding.component.scss']
})
export class ProgressBarFundingComponent implements OnInit {
  _color: string = '';
  threePointsDisplayed = false;

  @Input() set mainColor(value: string) {
    if (value) {
      if (value.includes('rgb') || value.includes('#')) {
        this._color = value;
      } else if (!value.includes('#')) {
        this._color = '#' + value;
      }
    }
  }
  get mainColor() {
    return this._color;
  }
  @Input() type = '';
  @Input() showGoal = false;
  @Input() totaGoalAmount = 0;
  @Input() currentAmount = 0;
  @Input() amountPerMentee = 600000; // in cents
  @Input() maxPoints = 6;

  barColor = BAR_COLOR_EMPTY;

  percentagePoint = '';
  percentagePointText = '';
  totalMentees = 0;
  totalMenteesItems: any[] = [];
  totalMenteesGoal = -1;

  ngOnInit() {

    if (this.totaGoalAmount >= this.currentAmount) {
      this.setFundingValues();
      return;
    }

    this.setValuesIfProjectIsOverfunded();
  }

  setFundingValues() {
    this.totalMenteesGoal = -1;
    this.percentagePoint = Math.round(this.currentAmount / this.totaGoalAmount * 100).toString() + '%';
    this.percentagePointText = this.percentagePoint;
    this.totalMentees = Math.ceil(this.totaGoalAmount / this.amountPerMentee);
    this.setMenteesItems();
  }

  setMenteesItems() {
    this.totalMenteesItems = [];
    const num = this.totalMentees;

    if (num > this.maxPoints) {
      this.threePointsDisplayed = true;
      this.totalMenteesItems.push(Math.ceil(num / 2));
      this.totalMenteesItems.push(num);
      return;
    }


    this.threePointsDisplayed = false;
    for (let i = 1; i <= this.totalMentees; i++) {
      this.totalMenteesItems.push(i);
    }
  }

  setValuesIfProjectIsOverfunded() {
    this.totalMentees = Math.ceil(this.currentAmount / this.amountPerMentee);
    this.setMenteesItems();

    const newTotalGoalAmount = this.totalMentees * this.amountPerMentee;
    this.percentagePoint = Math.round(this.currentAmount / newTotalGoalAmount * 100).toString() + '%';
    this.percentagePointText = Math.round(this.currentAmount / this.totaGoalAmount * 100).toString() + '%';
    this.totalMenteesGoal = Math.ceil(this.totaGoalAmount / this.amountPerMentee);;
  }

}
