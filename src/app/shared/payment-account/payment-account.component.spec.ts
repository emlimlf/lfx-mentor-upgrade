// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Card, CardBrand } from '@app/core';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject } from 'rxjs';
import { PaymentAccountComponent } from './payment-account.component';

describe('PaymentAccountComponent', () => {
  let component: PaymentAccountComponent;
  let fixture: ComponentFixture<PaymentAccountComponent>;
  let card: BehaviorSubject<Card | undefined>;

  beforeEach(
    waitForAsync(() => {
      card = new BehaviorSubject<Card | undefined>(undefined);
      const store = {
        dispatch: jasmine.createSpy('dispatch'),
        select: jasmine.createSpy('select').and.returnValue(card),
      };
      const modalService = jasmine.createSpyObj('NgbModal', ['open']);
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [
          { provide: NgbModal, useValue: modalService },
          { provide: Store, useValue: store },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getScreenReadableDigits', () => {
    it('adds spaces between digits', () => {
      expect(component.getScreenReadableDigits('1234')).toEqual('1 2 3 4');
    });
    it('adds spaces between zeros', () => {
      expect(component.getScreenReadableDigits('0000')).toEqual('0 0 0 0');
    });
  });

  describe('expired$', () => {
    it('will be false 1 second before the end of the expiry month', () => {
      // The month in the Date object is zero based.
      const expiryMonth = 6;
      const currentDate = new Date(2018, expiryMonth - 1, 30, 23, 59, 59);
      jasmine.clock().mockDate(currentDate);
      card.next({
        brand: CardBrand.MASTERCARD,
        expiryYear: 2018,
        expiryMonth,
        lastFourDigits: '1234',
      });

      expect(component.expired$).toBeObservable(cold('a', { a: false }));
    });
    it('will be true at exactly the start of the next month after expiry', () => {
      // The month in the Date object is zero based.
      const expiryMonth = 6;
      const currentDate = new Date(2018, expiryMonth, 1, 0, 0, 0);
      jasmine.clock().mockDate(currentDate);
      card.next({
        brand: CardBrand.MASTERCARD,
        expiryYear: 2018,
        expiryMonth: 6,
        lastFourDigits: '1234',
      });

      expect(component.expired$).toBeObservable(cold('a', { a: true }));
    });
  });
});
