// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, flatMap, map } from 'rxjs/operators';
import {
  LoadUserOrganizationsAction,
  OrganizationActionTypes,
  UserOrganizationsLoadedAction,
  UserOrganizationsLoadedFailedAction
} from './organization.actions';
import { OrganizationService } from '../organization.service';

@Injectable()
export class OrganizationEffects {
  @Effect()
  onLoadOrganization$ = this.actions$.pipe(
    ofType<LoadUserOrganizationsAction>(OrganizationActionTypes.LOAD_USER_ORGANIZATIONS),
    flatMap(_ => this.organizationService.getUserOrganizations()),
    map(organizations => new UserOrganizationsLoadedAction(organizations)),
    catchError(_ => of(new UserOrganizationsLoadedFailedAction()))
  );

  constructor(private organizationService: OrganizationService, private actions$: Actions) {}
}
