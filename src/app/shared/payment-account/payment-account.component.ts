// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card, CardBrand, CoreState, getCardSelector, LoadCardAction } from '@app/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditCardModalComponent, EditCardResult } from './edit-card-modal/edit-card-modal.component';

@Component({
  selector: 'app-payment-account',
  templateUrl: './payment-account.component.html',
  styleUrls: ['./payment-account.component.scss']
})
export class PaymentAccountComponent implements OnInit {
  cardBrand = CardBrand;
  card$: Observable<Card | undefined>;
  expired$: Observable<boolean>;

  @Output() paymentMethodChanged = new EventEmitter<boolean>();
  @Input() loading = false;

  constructor(private modalService: NgbModal, private store: Store<CoreState>) {
    this.card$ = store.select(getCardSelector);
    this.expired$ = this.card$.pipe(map(card => this.isExpired(card)));
    this.card$.subscribe(card => {
      const completed = card !== undefined && !this.isExpired(card);
      this.paymentMethodChanged.next(completed);
    });
  }

  ngOnInit() {}

  getScreenReadableDigits(digits: string): string {
    return digits.split('').join(' ');
  }

  shortYear(year: number) {
    return year % 100;
  }

  async openEditCardModal() {
    const modalRef = this.modalService.open(EditCardModalComponent, {
      centered: true,
      windowClass: 'no-border modal-window'
    });
    const result = await (modalRef.result as Promise<EditCardResult>);
    if (result === EditCardResult.CARD_ADDED) {
      this.store.dispatch(new LoadCardAction());
    }
  }

  private isExpired(card?: Card) {
    if (card === undefined) {
      return false;
    }

    // Cards expire at the end of the calendar month. The month field in the js Date object is zero based,
    // whereas card.expiryMonth is 1 based. This following date is the first day of the month after expiry.
    const expiryDate = new Date(card.expiryYear, card.expiryMonth);
    const now = new Date();
    return now >= expiryDate;
  }
}
