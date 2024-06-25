// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StripeService } from '@app/core';
import { BehaviorSubject } from 'rxjs';
import { CreditCardFieldComponent } from './credit-card-field.component';

describe('CreditCardFieldComponent', () => {
  let component: CreditCardFieldComponent;
  let fixture: ComponentFixture<CreditCardFieldComponent>;
  let card: any;
  let stripeJs: any;

  function getCardChangeCallback() {
    const args = card.on.calls.mostRecent().args;
    const callback: (element?: stripe.elements.ElementChangeResponse) => void = args[1];
    return callback;
  }

  beforeEach(async(() => {
    card = jasmine.createSpyObj('card', ['mount', 'on']);
    stripeJs = {
      elements: () => ({
        create: jasmine.createSpy('create').and.returnValue(card)
      }),
      createToken: jasmine.createSpy('createToken')
    };

    const stripeService: StripeService = {
      stripeJS$: new BehaviorSubject(stripeJs)
    } as any;
    TestBed.configureTestingModule({
      declarations: [CreditCardFieldComponent],
      providers: [{ provide: StripeService, useValue: stripeService }]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(CreditCardFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update errors based on data passed from card field', () => {
    const callback = getCardChangeCallback();
    const errorMessage = 'Some error message';
    const error = { message: errorMessage };
    callback({ error } as stripe.elements.ElementChangeResponse);
    expect(component.errorText).toEqual(errorMessage);
  });

  it("should clear card error when change event doesn't have error", () => {
    const callback = getCardChangeCallback();
    const errorMessage = 'Some error message';
    const error = { message: errorMessage };
    callback({} as stripe.elements.ElementChangeResponse);
    expect(component.errorText).toBeUndefined();
  });

  it("shouldn't clear card error when change event is empty", () => {
    const callback = getCardChangeCallback();
    const errorMessage = 'Some error message';
    component.errorText = errorMessage;
    callback();
    expect(component.errorText).toEqual(errorMessage);
  });

  it("will set the error text if stripe js isn't set ", async () => {
    component.stripe = undefined;
    let threwError = false;

    try {
      await component.createCardToken();
    } catch (error) {
      threwError = true;
    }
    expect(threwError).toBeTruthy();
    expect(component.errorText).not.toBeUndefined();
  });

  it("will set the error text if the card hasn't been created ", async () => {
    component.card = undefined;
    let threwError = false;
    try {
      await component.createCardToken();
    } catch (error) {
      threwError = true;
    }
    expect(threwError).toBeTruthy();
    expect(component.errorText).not.toBeUndefined();
  });

  it('will set the error text if the card has been rejected', async () => {
    const error: stripe.Error = {
      type: '',
      charge: ''
    };
    stripeJs.createToken.and.returnValue({ error });
    let threwError = false;
    try {
      await component.createCardToken();
    } catch (error) {
      threwError = true;
    }
    expect(threwError).toBeTruthy();
    expect(component.errorText).not.toBeUndefined();
  });

  it('will return token on success', async () => {
    const token: stripe.Token = {
      id: '12345',
      object: '',
      client_ip: '',
      created: 0,
      livemode: true,
      type: '',
      used: true
    };
    stripeJs.createToken.and.returnValue({ token });
    const tokenId = await component.createCardToken();
    expect(tokenId).toEqual('12345');
  });
});
