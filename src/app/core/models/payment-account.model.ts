// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export enum AccountType {
  STRIPE = 'stripe'
}

export interface PaymentAccount {
  type: AccountType;
  accountId: string;
}

export enum CardBrand {
  AMEX = 'American Express',
  DINERS_CLUB = 'Diners Club',
  DISCOVER = 'Discover',
  JCB = 'JCB',
  MASTERCARD = 'MasterCard',
  UNIONPAY = 'UnionPay',
  VISA = 'Visa',
  UNKNOWN = 'Card'
}

export interface Card {
  lastFourDigits: string;
  brand: CardBrand;
  expiryMonth: number;
  expiryYear: number;
}
