// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TriggerLoginAction } from './../../core/state/auth.actions';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert, AlertType, CoreState, DequeueAlertAction, getCurrentAlertSelector, AlertLink } from '@app/core';
import { Store } from '@ngrx/store';
import { NEVER, Observable, of, Subscription } from 'rxjs';
import { delay, filter, map, startWith, switchMap } from 'rxjs/operators';

export const ALERT_TIMEOUT_MS = 5000;

@Component({
  selector: 'app-alert-bar',
  templateUrl: './alert-bar.component.html',
  styleUrls: ['./alert-bar.component.scss'],
})
export class AlertBarComponent implements OnInit, OnDestroy {
  alert$: Observable<Alert>;
  alertVisible$: Observable<boolean>;

  alertClass$: Observable<string> = of('');

  alertLink$: Observable<AlertLink>;

  private alertTypeMap = {
    [AlertType.INFO]: 'bar-info',
    [AlertType.ERROR]: 'bar-error',
    [AlertType.SUCCESS]: 'bar-success',
  };

  private subscription: Subscription;

  constructor(private store: Store<CoreState>) {
    const currentAlert$ = store.select(getCurrentAlertSelector);

    // We want to always display the latest alert, even when it might have been removed already.
    // This is so the alert content stays the same while we are animating it's removal.
    this.alert$ = this.latestAlert(currentAlert$);
    this.alertVisible$ = currentAlert$.pipe(map(alert => alert !== undefined));
    this.alertClass$ = this.alert$.pipe(map(alert => this.classForAlert(alert)));
    this.alertLink$ = this.alert$.pipe(map(alert => (alert.alertLink ? alert.alertLink : { text: '', path: '' })));

    this.subscription = this.waitForAlertTimeout(currentAlert$).subscribe(_ => this.removeCurrentAlert());
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeCurrentAlert() {
    this.store.dispatch(new DequeueAlertAction());
  }

  redirectToPath() {
    let path = '/';
    this.alertLink$.subscribe(link => {
      path = link.path;
    });
    this.store.dispatch(new TriggerLoginAction([path]));
  }

  private latestAlert(alert$: Observable<Alert | undefined>): Observable<Alert> {
    const firstAlert: Alert = { alertText: '', alertType: AlertType.INFO };

    return alert$.pipe(
      filter(alert => alert !== undefined),
      map(alert => alert as Alert),
      startWith(firstAlert)
    );
  }

  private waitForAlertTimeout(alert$: Observable<Alert | undefined>) {
    // Everytime a new alert comes in, set a countdown and emit a value at the end.
    return alert$.pipe(
      switchMap(alert => {
        if (alert === undefined) {
          return NEVER;
        }
        return of(alert).pipe(delay(ALERT_TIMEOUT_MS));
      })
    );
  }

  private classForAlert(alert: Alert): string {
    const alertType = alert.alertType;
    return this.alertTypeMap[alertType];
  }
}
