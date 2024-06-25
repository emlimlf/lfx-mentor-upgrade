// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Balance, ExpenseCategory, ProjectBudget } from '../models';

export function estimateProjectBudget(project: ProjectBudget) {
  const developmentBudget = project.development !== undefined ? project.development.budget.amount : 0;
  const marketingBudget = project.marketing !== undefined ? project.marketing.budget.amount : 0;
  const meetupsBudget = project.meetups !== undefined ? project.meetups.budget.amount : 0;
  const travelBudget = project.travel !== undefined ? project.travel.budget.amount : 0;
  const apprenticeBudget = project.apprentice !== undefined ? project.apprentice.budget.amount : 0;
  const otherBudget = project.other !== undefined ? project.other.budget.amount : 0;

  return (developmentBudget + marketingBudget + meetupsBudget + travelBudget + apprenticeBudget + otherBudget) / 100;
}

export function getUnallocatedBalance(balance?: Balance) {
  if (balance === undefined) {
    return { balance: 0, credits: 0, debits: 0 };
  }
  let totalBalance = balance.balanceInCents;
  let credits = balance.creditInCents;
  let debits = balance.debitInCents;

  const categoryNames = [
    ExpenseCategory.DEVELOPMENT,
    ExpenseCategory.MARKETING,
    ExpenseCategory.MEETUPS,
    ExpenseCategory.APPRENTICE,
    ExpenseCategory.OTHER,
    ExpenseCategory.TRAVEL
  ];

  categoryNames.forEach(category => {
    const expenditure = balance.expenditures[category];
    if (expenditure === undefined) {
      return;
    }
    totalBalance -= expenditure.balanceInCents;
    credits -= expenditure.creditInCents;
    debits -= expenditure.debitInCents;
  });
  return {
    balance: totalBalance,
    credits,
    debits
  };
}
