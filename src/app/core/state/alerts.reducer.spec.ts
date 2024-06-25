// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Alert, AlertType } from '../models';
import { GoAction } from './router.actions';
import { DequeueAlertAction, QueueAlertAction } from './alerts.actions';
import { alertsReducer } from './alerts.reducer';

describe('alertsReducer', () => {
  it('adds an alert on SHOW_ALERT action', () => {
    const alert: Alert = {
      alertText: 'This is the alert',
      alertType: AlertType.INFO,
      alertLink: { text: '', path: '' }
    };
    const output = alertsReducer({ alertList: [] }, new QueueAlertAction(alert));
    expect(output).toEqual({
      alertList: [alert]
    });
  });
  it('removed an alert of REMOVE_ALERT action', () => {
    const alert: Alert = {
      alertText: 'This is the alert',
      alertType: AlertType.INFO,
      alertLink: { text: '', path: '' }
    };
    const input = { alertList: [alert] };
    const output = alertsReducer(input, new DequeueAlertAction());
    expect(output).toEqual({ alertList: [] });
  });
  it('does nothing for any other action', () => {
    const alert: Alert = {
      alertText: 'This is the alert',
      alertType: AlertType.INFO,
      alertLink: { text: '', path: '' }
    };
    const input = { alertList: [alert] };
    const output = alertsReducer(input, new GoAction([]));
    expect(output).toEqual(input);
  });
});
