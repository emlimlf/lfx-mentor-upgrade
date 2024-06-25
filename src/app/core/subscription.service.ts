// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { API_KEY } from './environment.configuration';
import {
  APIError,
  Card,
  CardBrand,
  ExpenseCategory,
  LoadingStatus,
  ProjectSubscription,
  SubscriptionPage
} from './models';
import { LoadCardAction } from './state/card.actions';
import { getCardState } from './state/card.reducer';
import { CoreState } from './state/core-state';
import { removeUndefined } from './utilities';
import { Paginator } from './utilities/paginator';

const cardTypeLookup: { [key: string]: CardBrand } = {
  'American Express': CardBrand.AMEX,
  'Diners Club': CardBrand.DINERS_CLUB,
  Discover: CardBrand.DISCOVER,
  JCB: CardBrand.JCB,
  MasterCard: CardBrand.MASTERCARD,
  UnionPay: CardBrand.UNIONPAY,
  Visa: CardBrand.VISA,
  Unknown: CardBrand.UNKNOWN
};

const categoryLookup: { [key: string]: ExpenseCategory } = {
  development: ExpenseCategory.DEVELOPMENT,
  apprentice: ExpenseCategory.APPRENTICE,
  marketing: ExpenseCategory.MARKETING,
  meetups: ExpenseCategory.MEETUPS,
  other: ExpenseCategory.OTHER,
  travel: ExpenseCategory.TRAVEL
};

@Injectable()
export class SubscriptionService {
  private paginator: Paginator<ProjectSubscription>;

  constructor(private httpClient: HttpClient, @Inject(API_KEY) private api: string, private store: Store<CoreState>) {
    const route = `${this.api}/me/subscriptions`;
    this.paginator = new Paginator(this.httpClient, route, obj => this.parseSubscription(obj));
  }

  addSubscriptionPaymentAccount(token: string) {
    const loadedCard$ = this.loadCardIfNeeded();
    return loadedCard$.pipe(
      switchMap(card => {
        if (card === undefined) {
          return this.createSubscriptionPaymentAccount(token);
        }
        return this.updateSubscriptionPaymentAccount(token);
      })
    );
  }

  getPaymentAccountCard(): Observable<Card | undefined | APIError> {
    const route = `${this.api}/me/payment-account`;
    return this.httpClient.get(route).pipe(
      map(response => this.parseCard(response)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(undefined);
        }
        return of({ message: error.message });
      })
    );
  }

  addSubscription(projectId: string, amountInCents: number, orgId?: string, category?: ExpenseCategory) {
    const route = `${this.api}/me/subscriptions`;
    const body = removeUndefined({
      amountInCents,
      projectId,
      orgId,
      category
    });
    return this.httpClient.post(route, body);
  }

  updateSubscription(projectId: string, amountInCents: number) {
    const route = `${this.api}/me/subscriptions/${projectId}`;
    const body = {
      amountInCents,
      projectId
    };
    return this.httpClient.patch(route, body);
  }

  getSubscription(projectId: string): Observable<ProjectSubscription> {
    const route = `${this.api}/me/subscriptions/${projectId}`;
    return this.httpClient.get(route).pipe(map(response => this.parseSubscription(response)));
  }

  deleteSubscription(projectId: string) {
    const route = `${this.api}/me/subscriptions/${projectId}`;
    return this.httpClient.delete(route);
  }

  getPage(cursor?: string): Observable<SubscriptionPage> {
    return this.paginator.getPage(cursor);
  }

  private createSubscriptionPaymentAccount(token: string) {
    const route = `${this.api}/me/payment-account`;
    const body = {
      type: 'stripe',
      token
    };
    return this.httpClient.put(route, body);
  }

  private updateSubscriptionPaymentAccount(token: string) {
    const route = `${this.api}/me/payment-account`;
    const body = {
      type: 'stripe',
      token
    };
    return this.httpClient.patch(route, body);
  }

  private loadCardIfNeeded() {
    const cardState$ = this.store.pipe(select(getCardState));
    return cardState$.pipe(
      tap(cardState => {
        if (cardState === undefined) {
          this.store.dispatch(new LoadCardAction());
        }
      }),
      filter(cardState => cardState !== undefined),
      map(cardState => cardState.status === LoadingStatus.LOADED && cardState.entry)
    );
  }

  private parseSubscription(response: any): ProjectSubscription {
    const createdOn = new Date(response.createdOn);
    const category = this.parseCategory(response.category);

    return removeUndefined({
      projectId: response.projectId,
      amountInCents: response.amountInCents,
      name: response.name,
      industry: response.industry,
      description: response.description,
      createdOn,
      color: response.color,
      orgId: response.orgId,
      logoUrl: response.logoUrl,
      category
    });
  }

  private parseCategory(response: any): ExpenseCategory | undefined {
    if (response === undefined || response === '') {
      return undefined;
    }
    return categoryLookup[response];
  }

  private parseCard(response: any): Card {
    let brand = CardBrand.UNKNOWN;
    if (response.brand !== undefined && cardTypeLookup[response.brand] !== undefined) {
      brand = cardTypeLookup[response.brand];
    }
    const lastFourDigits = response.lastFour as string;
    const expiryMonth = response.expiryMonth as number;
    const expiryYear = response.expiryYear as number;
    return {
      lastFourDigits,
      brand,
      expiryMonth,
      expiryYear
    };
  }
}
