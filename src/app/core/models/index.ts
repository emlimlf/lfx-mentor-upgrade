// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Page } from './page.model';
import { Project, ProjectSubscription } from './project.model';
import { Transaction } from './transaction.model';

export * from './page.model';
export * from './project.model';
export * from './remote-data.model';
export * from './transaction.model';
export * from './payment-account.model';
export * from './organization.model';

export type ProjectPage = Page<Project>;
export type SubscriptionPage = Page<ProjectSubscription>;
export type TransactionPage = Page<Transaction>;
export type RepoPage = Page<Repository>;

export enum AlertType {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success'
}

export interface AlertLink {
  text: string;
  path: string;
}

export interface Alert {
  alertText: string;
  alertType: AlertType;
  alertLink?: AlertLink;
}

export interface RepoOwner {
  name: string;
  avatarURL: string;
  repoNames: string[];
}

export interface Repository {
  ownerName: string;
  ownerAvatarURL: string;
  repoName: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  avatarUrl: string;
  name: string;
  givenName: string;
  familyName: string;
  expiry: Date;
}

export interface APIError {
  message: string;
}

export interface PieItem {
  color: string;
  startAngle: number;
  endAngle: number;
}

export interface PieList {
  items: PieItem[];
  totalAmount: number;
  runningTotal: number;
}

export interface Icon {
  src: string;
  width: number;
}

export interface CenterText {
  title: string;
  amount: number;
}

export function isAPIError(maybeError: any): maybeError is APIError {
  return maybeError && maybeError.message;
}
