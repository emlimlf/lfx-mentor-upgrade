// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Transaction, TransactionType, ExpenseCategory } from '@app/core';
import { TransactionListItemComponent } from './transaction-list-item.component';
import { ExpenseCategoryIconComponent } from './../expense-category-icon/expense-category-icon.component';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { CentsToDollarsPipe } from '@app/shared/cents-to-dollars.pipe';

@Component({
  template: `
    <app-transaction-list-item [transaction]="transaction"> </app-transaction-list-item>
  `,
})
class TestHostComponent {
  transaction: Transaction;
  @ViewChild(TransactionListItemComponent, { static: true }) item!: TransactionListItemComponent;

  constructor() {
    this.transaction = {
      name: 'The Name',
      type: TransactionType.DONATION,
      id: '12345',
      avatarUrl: 'https://avatarurl',
      amountInCents: 2000,
      createdOn: new Date(0),
      organization: {
        name: '',
        id: '',
        avatarUrl: '',
      },
    };
  }
}

describe('TransactionsListItemComponent', () => {
  let component: TransactionListItemComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  const store = {
    select: jasmine
      .createSpy('select')
      .and.returnValue(of({ name: 'Google', avatarUrl: 'https://someurl.com/avatar' })),
  };
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          TransactionListItemComponent,
          TestHostComponent,
          ExpenseCategoryIconComponent,
          AvatarComponent,
          CentsToDollarsPipe,
        ],
        imports: [InlineSVGModule.forRoot(), NgbModule.forRoot()],
        providers: [{ provide: Store, useValue: store }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatMerchantNameAndComments', () => {
    it('should only display comments if no merchant response', () => {
      component.expense = {
        id: 'id123456789',
        merchantName: '',
        description: 'abc',
        submitterName: 'submitter',
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.DEVELOPMENT,
        amountInCents: 23433,
        createdOn: new Date(),
        organization: {
          name: '',
          id: '',
          avatarUrl: '',
        },
      };
      const expected = 'abc';
      const output = component.formatMerchantNameAndComments();
      expect(output).toEqual(expected);
    });

    it('should display merchant and comments if merchantName and comments exist', () => {
      component.expense = {
        id: 'id123456789',
        merchantName: 'Google',
        description: 'abc',
        submitterName: 'submitter',
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.DEVELOPMENT,
        amountInCents: 23433,
        createdOn: new Date(),
        organization: {
          name: '',
          id: '',
          avatarUrl: '',
        },
      };
      const expected = 'Google - abc';
      const output = component.formatMerchantNameAndComments();
      expect(output).toEqual(expected);
    });

    it('should display merchant name if comments do not exist', () => {
      component.expense = {
        id: 'id123456789',
        merchantName: 'Google',
        description: '',
        submitterName: 'submitter',
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.DEVELOPMENT,
        amountInCents: 23433,
        createdOn: new Date(),
        organization: {
          name: '',
          id: '',
          avatarUrl: '',
        },
      };
      const expected = 'Google';
      const output = component.formatMerchantNameAndComments();
      expect(output).toEqual(expected);
    });
  });
});
