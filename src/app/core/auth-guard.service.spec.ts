// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { inject, TestBed } from '@angular/core/testing';
import { CoreState, TriggerLoginAction } from '.';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject } from 'rxjs';
import { AuthGuardService } from './auth-guard.service';

describe('AuthGuardService', () => {
  let store: Store<CoreState>;
  const authState = new BehaviorSubject<boolean>(false);

  beforeEach(() => {
    store = {
      dispatch: jasmine.createSpy('dispatch'),
      select: jasmine.createSpy('select').and.returnValue(authState)
    } as any;

    TestBed.configureTestingModule({
      providers: [AuthGuardService, { provide: Store, useValue: store }]
    });

    authState.next(false);
  });

  it('should be created', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));

  describe('canActivate', () => {
    it("will trigger a login if the user isn't logged in", inject([AuthGuardService], (service: AuthGuardService) => {
      const url = 'some-url';
      const router: any = {};
      const state: any = { url };

      const allowed$ = service.canActivate(router, state);
      const expected$ = cold('a', { a: false });
      expect(allowed$).toBeObservable(expected$);
      expect(store.dispatch).toHaveBeenCalledWith(new TriggerLoginAction([url]));
    }));

    it('will allow the route to activate if the user is logged in', inject(
      [AuthGuardService],
      (service: AuthGuardService) => {
        const url = 'some-url';
        const router: any = {};
        const state: any = { url };
        authState.next(true);
        const allowed$ = service.canActivate(router, state);
        const expected$ = cold('a', { a: true });
        expect(allowed$).toBeObservable(expected$);
        expect(store.dispatch).not.toHaveBeenCalled();
      }
    ));
  });
});
