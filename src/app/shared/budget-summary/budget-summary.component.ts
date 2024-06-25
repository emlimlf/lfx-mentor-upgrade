// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnChanges } from '@angular/core';
import {
  Budget,
  BudgetColor,
  CenterText,
  percentageToRadians,
  PieItem,
  ProjectBudget,
  roundPercentage
} from '@app/core';
import { estimateProjectBudget } from '@app/core';

interface BudgetList {
  sections: PieItem[];
  totalAmount: number;
  runningTotal: number;
}

interface BudgetOwner {
  budget: Budget;
}

@Component({
  selector: 'app-budget-summary',
  templateUrl: './budget-summary.component.html',
  styleUrls: ['./budget-summary.component.scss']
})
export class BudgetSummaryComponent implements OnChanges {
  @Input() project!: ProjectBudget;
  @Input() alignedInRow = false;

  sections: PieItem[] = [];
  centerText: CenterText = { title: '', amount: 0 };

  estimatedBudget = 0;
  developmentProportion = 0;
  marketingProportion = 0;
  meetupsProportion = 0;
  travelProportion = 0;
  apprenticeProportion = 0;
  otherProportion = 0;

  color = BudgetColor;

  constructor() {}

  ngOnChanges() {
    const { development, marketing, meetups, travel, apprentice, other } = this.project;
    this.estimatedBudget = estimateProjectBudget(this.project);

    this.developmentProportion = this.proportion(development);
    this.marketingProportion = this.proportion(marketing);
    this.meetupsProportion = this.proportion(meetups);
    this.travelProportion = this.proportion(travel);
    this.apprenticeProportion = this.proportion(apprentice);
    this.otherProportion = this.proportion(other);

    let list: BudgetList = { sections: [], totalAmount: this.estimatedBudget * 100, runningTotal: 0 };
    list = this.appendSection(list, BudgetColor.DEVELOPMENT, development);
    list = this.appendSection(list, BudgetColor.MARKETING, marketing);
    list = this.appendSection(list, BudgetColor.MEETUPS, meetups);
    list = this.appendSection(list, BudgetColor.TRAVEL, travel);
    list = this.appendSection(list, BudgetColor.APPRENTICE, apprentice);
    list = this.appendSection(list, BudgetColor.OTHER, other);

    this.sections = list.sections;
    this.centerText = { title: 'Annual Goal', amount: this.estimatedBudget };
  }

  private appendSection(budgetList: BudgetList, color: string, owner?: BudgetOwner): BudgetList {
    if (owner === undefined || owner.budget.amount <= 0) {
      return budgetList;
    }
    const { budget } = owner;
    const delta = budget.amount / budgetList.totalAmount;
    const section = {
      color,
      startAngle: percentageToRadians(budgetList.runningTotal),
      endAngle: percentageToRadians(budgetList.runningTotal + delta)
    };
    return {
      ...budgetList,
      sections: [...budgetList.sections, section],
      runningTotal: budgetList.runningTotal + delta
    };
  }

  private proportion(owner?: BudgetOwner) {
    return owner !== undefined ? roundPercentage(owner.budget.amount / this.estimatedBudget, 2) : 0;
  }
}
