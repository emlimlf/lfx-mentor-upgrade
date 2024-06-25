// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ProjectDetails } from './models/transaction.model';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_KEY } from './environment.configuration';
import { ExpenseCategory, Transaction, TransactionPage, TransactionType, Organization } from './models';
import { Paginator } from './utilities/paginator';

const categoryLookup: { [key: string]: ExpenseCategory } = {
  development: ExpenseCategory.DEVELOPMENT,
  marketing: ExpenseCategory.MARKETING,
  meetups: ExpenseCategory.MEETUPS,
  apprentice: ExpenseCategory.APPRENTICE,
  other: ExpenseCategory.OTHER,
  travel: ExpenseCategory.TRAVEL
};

const transactionTypeLookup: { [key: string]: TransactionType } = {
  donation: TransactionType.DONATION,
  expense: TransactionType.EXPENSE,
  personal: TransactionType.PERSONAL
};

@Injectable()
export class TransactionsService {
  constructor(private httpClient: HttpClient, @Inject(API_KEY) private api: string) {}

  public getPage(projectId: string, cursor?: string): Observable<TransactionPage> {
    const route = `${this.api}/projects/${projectId}/transactions`;
    const paginator = new Paginator(this.httpClient, route, obj => this.parseTransaction(obj));
    return paginator.getPage(cursor);
  }

  public getMyPage(cursor?: string): Observable<TransactionPage> {
    const route = `${this.api}/me/transactions`;
    const paginator = new Paginator(this.httpClient, route, obj => this.parseTransaction(obj));
    return paginator.getPage(cursor);
  }

  private parseTransaction(response: any): Transaction {
    const createdOn = new Date(response.createdOn);
    const type = transactionTypeLookup[response.type];
    const id = response.id as string;
    const amountInCents = response.amountInCents as number;
    const organization: Organization = {
      id: response.organization.organizationId,
      name: response.organization.name,
      avatarUrl: response.organization.avatarUrl
    };

    if (type === TransactionType.DONATION) {
      const name = response.name as string;
      const avatarUrl = response.avatarUrl as string;
      return {
        createdOn,
        avatarUrl,
        type,
        id,
        amountInCents,
        name,
        organization
      };
    } else if (type === TransactionType.EXPENSE) {
      const category = categoryLookup[response.category];
      const description = response.description as string;
      const merchantName = response.merchantName as string;
      const submitterName = response.submitterName as string;
      return {
        createdOn,
        type,
        id,
        amountInCents,
        category,
        description,
        merchantName,
        submitterName,
        organization
      };
    } else {
      const projectDetails = response.projectDetails as ProjectDetails;
      return {
        createdOn,
        type,
        id,
        amountInCents,
        projectDetails,
        organization
      };
    }
  }
}
