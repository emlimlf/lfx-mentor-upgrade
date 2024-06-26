// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SubscriptionService } from '@app/core';
import { CreditCardFieldComponent } from '../../credit-card-field/credit-card-field.component';
import { SubmitState } from '../../submit-button/submit-button.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { delay, mergeMap, tap } from 'rxjs/operators';

export enum EditCardResult {
  CARD_ADDED,
  DISMISSED,
}

const SUBMIT_CLOSE_DELAY_MS = 1200;

@Component({
  selector: 'app-edit-card-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
})
export class EditCardModalComponent implements OnInit, OnDestroy {
  @ViewChild(CreditCardFieldComponent, { static: true }) creditCard!: CreditCardFieldComponent;

  submitState$: Observable<SubmitState>;
  private baseState$ = new BehaviorSubject<SubmitState.READY | SubmitState.SUBMITTING | SubmitState.SUCCESS>(
    SubmitState.READY
  );

  private formCompleted$ = new BehaviorSubject<boolean>(false);
  private subscription?: Subscription;

  constructor(public activeModal: NgbActiveModal, private subscriptionService: SubscriptionService) {
    this.submitState$ = combineLatest(
      [this.baseState$, this.formCompleted$],
      (state: SubmitState, completed: boolean) => this.getSubmitButtonState(state, completed)
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    const { subscription } = this;
    if (subscription !== undefined) {
      subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  close() {
    return this.activeModal.close(EditCardResult.DISMISSED);
  }

  addCard() {
    this.baseState$.next(SubmitState.SUBMITTING);
    const promise = this.creditCard.createCardToken();
    this.subscription = from(promise)
      .pipe(
        mergeMap(token => this.subscriptionService.addSubscriptionPaymentAccount(token)),
        tap(_ => this.baseState$.next(SubmitState.SUCCESS)),
        delay(SUBMIT_CLOSE_DELAY_MS)
      )
      .subscribe(
        _ => {
          this.activeModal.close(EditCardResult.CARD_ADDED);
        },
        _ => {
          this.creditCard.errorText = "Couldn't save payment information";
          this.baseState$.next(SubmitState.READY);
        }
      );
  }

  onCompleted(completed: boolean) {
    this.formCompleted$.next(completed);
  }

  private getSubmitButtonState(originalState: SubmitState, formCompleted: boolean) {
    if (originalState === SubmitState.READY && !formCompleted) {
      return SubmitState.DISABLED;
    }
    return originalState;
  }
}
