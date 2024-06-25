// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { routerReducer } from '@ngrx/router-store';
import { alertsReducer } from './alerts.reducer';
import { ApproveProjectEffects } from './approve-project.effects';
import { authReducer } from './auth.reducer';
import { CardEffects } from './card.effects';
import { cardReducer } from './card.reducer';
import { MetaEffects } from './meta.effects';
import { OrganizationEffects } from './organization.effects';
import { organizationReducer } from './organization.reducer';
import { PrivateProjectsEffects } from './private-project-effects';
import { privateProjectsReducer } from './private-project.reducer';
import { RouterEffects } from './router.effects';
import { SentryEffects } from './sentry.effects';
import { subscriptionPageReducer } from './subscription-page.reducer';
import { SubscriptionsEffects } from './subscription.effects';
import { subscriptionsReducer } from './subscription.reducer';
import { TransactionEffects } from './transactions.effects';
import { transactionPageReducer } from './transactions.page.reducer';
import { transactionsReducer } from './transactions.reducer';

export * from './auth.actions';
export * from './router.actions';
export * from './auth.reducer';
export * from './card.actions';
export * from './card.reducer';
export * from './subscription.actions';
export * from './subscription.reducer';
export * from './subscription-page.actions';
export * from './subscription-page.reducer';
export * from './subscription.selector';
export * from './core-state';
export * from './alerts.actions';
export * from './alerts.reducer';
export * from './transactions.page.reducer';
export * from './transactions.reducer';
export * from './transactions.page.actions';
export * from './transactions.selector';
export * from './private-project.actions';
export * from './organization.actions';
export * from './organization.reducer';

export const effects = [
  RouterEffects,
  SentryEffects,
  MetaEffects,
  CardEffects,
  SubscriptionsEffects,
  TransactionEffects,
  ApproveProjectEffects,
  PrivateProjectsEffects,
  OrganizationEffects
];

export const reducers = {
  auth: authReducer,
  router: routerReducer,
  card: cardReducer,
  subscriptions: subscriptionsReducer,
  subscriptionPages: subscriptionPageReducer,
  alerts: alertsReducer,
  backers: transactionsReducer,
  backersPage: transactionPageReducer,
  privateProjects: privateProjectsReducer,
  organization: organizationReducer
};
