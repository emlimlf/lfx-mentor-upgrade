// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { mergeMap, map } from 'rxjs/operators';
import { Observable, NEVER, of, Subscription } from 'rxjs';
import {
  ExpenseCategory,
  Transaction,
  TransactionDonation,
  TransactionExpense,
  TransactionType,
  TransactionPersonal,
  Identity,
  CoreState,
  Organization,
} from '@app/core';
import { getUserInfoState } from '@app/core/state/auth.reducer';

@Component({
  selector: 'app-transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrls: ['./transaction-list-item.component.scss'],
})
export class TransactionListItemComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Input() isCompleted = false;
  expense?: TransactionExpense;
  donation?: TransactionDonation;
  project?: TransactionPersonal;
  userIdentity$: Observable<Identity>;

  readonly Categories = ExpenseCategory;
  get donator(): Identity {
    if (this.donation === undefined) {
      return {
        name: '',
        avatarUrl: '',
      };
    }

    if (this.donation && this.donation.organization.id) {
      return {
        name: this.donation.organization.name,
        avatarUrl: this.donation.organization.avatarUrl,
      };
    } else {
      return {
        name: this.donation.name,
        avatarUrl: this.donation.avatarUrl,
      };
    }
  }

  get projectOwner$(): Observable<Identity> {
    if (this.project === undefined) {
      return of({
        name: '',
        avatarUrl: '',
      });
    }

    if (this.project && this.project.organization.id) {
      return of({
        name: this.project.organization.name,
        avatarUrl: this.project.organization.avatarUrl,
      });
    } else {
      return this.userIdentity$;
    }
  }
  constructor(store: Store<CoreState>) {
    this.userIdentity$ = store.select(getUserInfoState).pipe(
      mergeMap(state => {
        if (state === undefined) {
          return NEVER;
        }
        return of(state);
      })
    );
  }

  ngOnInit() {
    const transaction = this.transaction;
    if (transaction.type === TransactionType.EXPENSE) {
      this.expense = transaction;
    } else if (transaction.type === TransactionType.DONATION) {
      this.donation = transaction;
    } else {
      this.project = transaction;
    }
  }

  formatMerchantNameAndComments() {
    if (this.expense === undefined) {
      return '';
    }
    if (this.expense.merchantName && this.expense.description) {
      return this.expense.merchantName + ' - ' + this.expense.description;
    } else if (!this.expense.merchantName && this.expense.description) {
      return this.expense.description;
    } else {
      return this.expense.merchantName;
    }
  }
}
