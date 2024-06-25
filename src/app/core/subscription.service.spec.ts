// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { reducers } from './state';
import { API_KEY } from './environment.configuration';
import { CardBrand, SubscriptionPage } from './models';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let injector: TestBed;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://someurl';

  function makeSubscriptionPageResponse(next?: string, previous?: string) {
    return {
      entries: [
        {
          projectId: '1234',
          createdOn: 0,
          amountInCents: 100,
          industry: 'Blockchain',
          name: 'The Title',
          color: 'CCCCCC',
          description: 'The description',
          logoUrl: 'http://logoUrl'
        }
      ],
      link: {
        next,
        previous
      }
    };
  }

  function makeSubscriptionPage(next?: string, previous?: string): SubscriptionPage {
    return {
      entries: [
        {
          projectId: '1234',
          createdOn: new Date(0),
          amountInCents: 100,
          industry: 'Blockchain',
          name: 'The Title',
          color: 'CCCCCC',
          description: 'The description',
          logoUrl: 'http://logoUrl'
        }
      ],
      link: {
        nextCursor: next,
        previousCursor: previous
      }
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot(reducers as any)],
      providers: [SubscriptionService, { provide: API_KEY, useValue: baseUrl }]
    });
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    service = injector.get(SubscriptionService);
  });

  describe('addSubscriptionPaymentAccount', () => {
    it('can add a stripe account', () => {
      const token = '1234';
      const response = {};
      const expected = {};

      service.addSubscriptionPaymentAccount(token).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/payment-account`);
      expect(testRequest.request.method).toBe('PATCH');
      testRequest.flush(response);
    });
  });

  describe('getPaymentAccountCard', () => {
    it('gets a card', (done: DoneFn) => {
      const response = {
        lastFour: '1234',
        brand: 'American Express',
        expiryMonth: 4,
        expiryYear: 2018
      };

      service.getPaymentAccountCard().subscribe(card => {
        expect(card).toEqual({ lastFourDigits: '1234', brand: CardBrand.AMEX, expiryMonth: 4, expiryYear: 2018 });
        done();
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/payment-account`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });

    it('returns an empty card on a 404', (done: DoneFn) => {
      service.getPaymentAccountCard().subscribe(card => {
        expect(card).toBeUndefined();
        done();
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/payment-account`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush('', { status: 404, statusText: 'Missing' });
    });
  });

  describe('addSubscription', () => {
    it('can add a subscription', () => {
      const amountInCents = 100;
      const projectId = '12345';
      const subscriptionId = '12345';
      const response = { amountInCents, projectId, subscriptionId };
      service.addSubscription(projectId, amountInCents).subscribe(result => {
        expect(result).toEqual(response);
      });
      const testRequest = httpMock.expectOne(`${baseUrl}/me/subscriptions`);
      expect(testRequest.request.method).toBe('POST');
      testRequest.flush(response);
    });
  });

  describe('updateSubscription', () => {
    it('can update a subscription', () => {
      const amountInCents = 100;
      const projectId = '12345';
      const subscriptionId = '12345';
      const response = { amountInCents, projectId, subscriptionId };
      service.updateSubscription(projectId, amountInCents).subscribe(result => {
        expect(result).toEqual(response);
      });
      const testRequest = httpMock.expectOne(`${baseUrl}/me/subscriptions/${projectId}`);
      expect(testRequest.request.method).toBe('PATCH');
      testRequest.flush(response);
    });
  });

  describe('getSubscription', () => {
    it('can retrieve the subscription', () => {
      const amountInCents = 100;
      const projectId = '12345';
      const createdOn = new Date(0);
      const response = {
        amountInCents,
        projectId,
        name: 'My Sub',
        industry: 'My Industry',
        description: 'A description',
        createdOn: createdOn.toString(),
        color: 'CCCCCC',
        logoUrl: 'http://logoUrl'
      };

      service.getSubscription(projectId).subscribe(result => {
        expect(result).toEqual({ ...response, createdOn });
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/subscriptions/${projectId}`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });

  describe('getPage', () => {
    it('loads a page of subscriptions', () => {
      const response = makeSubscriptionPageResponse();
      const expected = makeSubscriptionPage();

      service.getPage().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/subscriptions`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });

  describe('deleteSubscription', () => {
    it('deletes a subscription', (done: DoneFn) => {
      const projectId = '1234';

      service.deleteSubscription(projectId).subscribe(() => {
        done();
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/subscriptions/${projectId}`);
      expect(testRequest.request.method).toBe('DELETE');
      testRequest.flush('', { status: 204, statusText: 'Deleted' });
    });
  });
});
