// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AlertsModel } from './alerts.reducer';
import { AuthModel } from './auth.actions';
import { CardModel } from './card.reducer';
import { OrganizationModel } from './organization.reducer';
import { SubscriptionPageState } from './subscription-page.reducer';
import { SubscriptionState } from './subscription.reducer';
import { TransactionPageState } from './transactions.page.reducer';
import { TransactionsState } from './transactions.reducer';

export interface CoreState {
  auth: AuthModel;
  card: CardModel;
  subscriptions: SubscriptionState;
  subscriptionPages: SubscriptionPageState;
  alerts: AlertsModel;
  backers: TransactionsState;
  backersPage: TransactionPageState;
  organization: OrganizationModel;
}
