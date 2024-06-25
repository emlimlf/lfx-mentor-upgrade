// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertType, CoreState, QueueAlertAction, reducers } from '@app/core';
import { Store, StoreModule } from '@ngrx/store';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { ALERT_TIMEOUT_MS, AlertBarComponent } from './alert-bar.component';

describe('AlertBarComponent', () => {
  let component: AlertBarComponent;
  let fixture: ComponentFixture<AlertBarComponent>;
  let store: Store<CoreState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AlertBarComponent],
      imports: [StoreModule.forRoot(reducers as any)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("shouldn't display an alert when one isn't in the store", () => {
    const expected = cold('a', { a: false });
    expect(component.alertVisible$).toBeObservable(expected);
  });

  it('should display an alert when one is in the store', () => {
    const alert = { alertText: 'This alert', alertType: AlertType.INFO };
    store.dispatch(new QueueAlertAction(alert));
    const expected = cold('a', { a: true });
    expect(component.alertVisible$).toBeObservable(expected);
  });

  it('should hide an alert after a timeout', (done: DoneFn) => {
    getTestScheduler().run(handlers => {
      const { expectObservable } = handlers;
      const alert = { alertText: 'This alert', alertType: AlertType.INFO };
      store.dispatch(new QueueAlertAction(alert));
      expectObservable(component.alertVisible$).toBe(`a ${ALERT_TIMEOUT_MS - 1}ms b`, { a: true, b: false });
      done();
    });
  });
});
