// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { ProjectService } from '@app/core/project.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import {
  LoadPrivateProjectsAction,
  PrivateProjectsActionTypes,
  PrivateProjectLoadedAction,
  PrivateProjectLoadedFailedAction,
} from './private-project.actions';

@Injectable()
export class PrivateProjectsEffects {
  requestOnLoadProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType<LoadPrivateProjectsAction>(PrivateProjectsActionTypes.LOAD_PROJECT),
      mergeMap(action => this.requestProjects())
    );
  });

  constructor(private actions$: Actions, private projectService: ProjectService) {}

  private requestProjects() {
    return this.projectService.getByOwner().pipe(
      map(projects => new PrivateProjectLoadedAction(projects)),
      catchError(_ => of(new PrivateProjectLoadedFailedAction()))
    );
  }
}
