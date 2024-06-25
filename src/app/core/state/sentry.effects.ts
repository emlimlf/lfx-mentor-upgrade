// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { SentryService } from '../sentry.service';
import { Actions, Effect } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class SentryEffects {
  @Effect({ dispatch: false })
  logActionsAsBreadcrumbs$ = this.actions$.pipe(
    tap(action => this.sentryService.captureBreadcrumb({ message: action.type }))
  );

  constructor(private actions$: Actions, private sentryService: SentryService) {}
}
