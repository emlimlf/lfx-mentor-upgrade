// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StripeService, SubscriptionService } from '@app/core';
import { SharedModule } from '../../shared.module';
import { SubmitState } from '../../submit-button/submit-button.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject, Subject } from 'rxjs';
import { EditCardModalComponent } from './edit-card-modal.component';

describe('EditCardModalComponent', () => {
  let component: EditCardModalComponent;
  let fixture: ComponentFixture<EditCardModalComponent>;
  let subscriptionService: SubscriptionService;
  let addSubscriptionPaymentAccountResponse: Subject<any>;

  beforeEach(async(() => {
    const card = jasmine.createSpyObj('card', ['mount', 'on']);

    const stripeJs = {
      elements: () => ({
        create: jasmine.createSpy('create').and.returnValue(card),
      }),
    };

    const stripeService = {
      stripeJS$: new BehaviorSubject(stripeJs),
    };

    addSubscriptionPaymentAccountResponse = new Subject<any>();
    subscriptionService = {
      addSubscriptionPaymentAccount: jasmine
        .createSpy('addSubscriptionPaymentAccount')
        .and.returnValue(addSubscriptionPaymentAccountResponse),
    } as any;

    TestBed.configureTestingModule({
      imports: [NgbModule.forRoot(), SharedModule],
      providers: [
        NgbActiveModal,
        { provide: StripeService, useValue: stripeService },
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be submittable when the credit card field is complete', () => {
    component.creditCard.completed.next(true);
    expect(component.submitState$).toBeObservable(cold('a', { a: SubmitState.READY }));
  });

  it("shouldn't be submittable when the credit card field is incomplete", () => {
    component.creditCard.completed.next(false);
    expect(component.submitState$).toBeObservable(cold('a', { a: SubmitState.DISABLED }));
  });

  it('should be in a submitting state when the submit button is pressed', () => {
    component.creditCard.completed.next(true);

    component.addCard();
    expect(component.submitState$).toBeObservable(cold('a', { a: SubmitState.SUBMITTING }));
  });

  it("should be in a ready state if a payment account can't be saved", async () => {
    component.creditCard.completed.next(true);

    component.addCard();
    addSubscriptionPaymentAccountResponse.error('');
    await fixture.whenStable();
    expect(component.submitState$).toBeObservable(cold('a', { a: SubmitState.READY }));
  });

  it('should be in a success state if a payment was saved', async () => {
    spyOn(component.creditCard, 'createCardToken').and.returnValue(
      new Promise<string>(resolve => resolve('1234'))
    );
    component.creditCard.completed.next(true);
    const activeModal: NgbActiveModal = TestBed.inject(NgbActiveModal);
    spyOn(activeModal, 'close').and.callThrough();

    component.addCard();
    await fixture.whenStable();

    addSubscriptionPaymentAccountResponse.next(true);
    await fixture.whenStable();

    expect(component.submitState$).toBeObservable(cold('a', { a: SubmitState.SUCCESS }));
  });
});
