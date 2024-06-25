// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Alert } from '../models';
import { Action } from '@ngrx/store';

export enum AlertActionTypes {
  QUEUE_ALERT = '[Alert] QUEUE_ALERT',
  DEQUEUE_ALERT = '[Alert] DEQUEUE_ALERT'
}

export class QueueAlertAction implements Action {
  readonly type = AlertActionTypes.QUEUE_ALERT;
  readonly payload: Alert;

  constructor(alert: Alert) {
    this.payload = alert;
  }
}

export class DequeueAlertAction implements Action {
  readonly type = AlertActionTypes.DEQUEUE_ALERT;
}

export type AlertActionsUnion = QueueAlertAction | DequeueAlertAction;
