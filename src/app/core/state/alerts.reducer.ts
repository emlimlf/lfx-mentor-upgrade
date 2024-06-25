// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Alert } from '../models';
import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { AlertActionsUnion, AlertActionTypes } from './alerts.actions';

export const alertsSelector = createFeatureSelector<AlertsModel>('alerts');
export const getCurrentAlertSelector = createSelector(alertsSelector, alertsModel => {
  if (alertsModel.alertList.length > 0) {
    return alertsModel.alertList[0];
  }
  return undefined;
});

export interface AlertsModel {
  alertList: Alert[];
}

export function alertsReducer(state: Readonly<AlertsModel> = { alertList: [] }, action: Action): Readonly<AlertsModel> {
  const alertAction = action as AlertActionsUnion;
  switch (alertAction.type) {
    case AlertActionTypes.QUEUE_ALERT:
      return { alertList: [...state.alertList, alertAction.payload] };
    case AlertActionTypes.DEQUEUE_ALERT:
      const [_, ...rest] = state.alertList;
      return { alertList: rest };
  }
  return state;
}
