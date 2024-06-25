// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { StripeService } from '@app/core/stripe.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-credit-card-field',
  templateUrl: './credit-card-field.component.html',
  styleUrls: ['./credit-card-field.component.scss']
})
export class CreditCardFieldComponent implements OnInit, AfterViewInit {
  @ViewChild('cardInfo') cardInfo!: ElementRef;

  errorText?: string;
  stripe?: stripe.Stripe;
  card?: stripe.elements.Element;
  @Output() completed = new EventEmitter<boolean>();

  constructor(
     private stripeService: StripeService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Adding a delay here allows parent elements for finish configuring their view.
    // this.stripeService.stripeJS$.pipe(delay(50)).subscribe(stripe => this.loadStripe(stripe));
  }

  async createCardToken() {
    const { stripe, card } = this;
    if (stripe === undefined || card === undefined) {
      this.errorText = 'Stripe currently unavailable';
      throw Error('Stripe unavailable');
    }
    const { error, token } = await stripe.createToken(card);
    if (error !== undefined || token === undefined) {
      this.errorText = "Couldn't save credit card";
      throw Error("Couldn't save credit card");
    }
    return token.id;
  }

  private loadStripe(stripe: stripe.Stripe) {
    const elements = stripe.elements({
      fonts: [{ cssSrc: 'https://fonts.googleapis.com/css?family=Poppins:300,400,600' }]
    });

    // Setting the font size of an input to less that 16px will cause mobile browsers to zoom in when entering text into
    // that element.
    const style = {
      base: {
        fontFamily: 'Poppins',
        fontSize: '16px' // Stripe's default font size is 14px,
      }
    };
    const card = elements.create('card', { style });
    card.mount(this.cardInfo.nativeElement);
    card.on('change', event => {
      this.updateErrorText(event);
    });
    this.card = card;
    this.stripe = stripe;
  }

  private updateErrorText(event?: stripe.elements.ElementChangeResponse) {
    if (event === undefined) {
      return;
    }
    this.completed.next(event.complete);
    const error = event.error;
    this.errorText = error !== undefined ? error.message : undefined;
  }
}
