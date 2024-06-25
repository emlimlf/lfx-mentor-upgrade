// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { ExpenseCategory } from '@app/core';

@Component({
  selector: 'app-expense-category-icon',
  templateUrl: './expense-category-icon.component.html',
  styleUrls: ['./expense-category-icon.component.scss']
})
export class ExpenseCategoryIconComponent implements OnInit {
  @Input() category: ExpenseCategory = ExpenseCategory.OTHER;

  readonly Categories = ExpenseCategory;

  constructor() {}

  ngOnInit() {}
}
