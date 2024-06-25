// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Organization } from './organization.model';

export enum TransactionType {
  EXPENSE = 'expense',
  DONATION = 'donation',
  PERSONAL = 'personal'
}

export enum ExpenseCategory {
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  TRAVEL = 'travel',
  MEETUPS = 'meetups',
  APPRENTICE = 'apprentice',
  OTHER = 'other'
}

export interface ProjectDetails {
  projectId: string;
  name: string;
  logoUrl: string;
}

export interface TransactionBase {
  type: TransactionType;
  id: string;
  amountInCents: number;
  createdOn: Date;
  organization: Organization;
}

export interface TransactionExpense extends TransactionBase {
  type: TransactionType.EXPENSE;
  category: ExpenseCategory;
  description: string;
  merchantName: string;
  submitterName: string;
}

export interface TransactionDonation extends TransactionBase {
  type: TransactionType.DONATION;
  avatarUrl: string;
  name: string;
}

export interface TransactionPersonal extends TransactionBase {
  type: TransactionType.PERSONAL;
  projectDetails: ProjectDetails;
}

export type Transaction = TransactionExpense | TransactionDonation | TransactionPersonal;
