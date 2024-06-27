// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { ProjectService } from '../project.service';
import { LoggerService } from '../logger.service';
import { Actions, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { QueueAlertAction } from './alerts.actions';
import { GoAction } from './router.actions';
import { isNavigationActionToRoute } from '../utilities';
import { EMAIL_APPROVE_REDIRECT_ROUTE, ERROR_ROUTE, LANDING_ROUTE } from '../constants';
import { Project, ProjectStatus, AlertType } from '../models';

@Injectable()
export class ApproveProjectEffects {
  completeProjectApproval$ = createEffect(() => {
    return this.actions$.pipe(
      isNavigationActionToRoute(EMAIL_APPROVE_REDIRECT_ROUTE),
      mergeMap(action => this.projectService.postJWTFromBrowserURL(action.payload.routerState)),
      map(result => result.project),
      mergeMap(project =>
        of(
          this.goActionFromProject(project),
          new QueueAlertAction({
            alertText: this.successMessageFromStatus(project.status),
            alertType: AlertType.SUCCESS,
          })
        )
      ),
      catchError(error => {
        this.loggerService.error(error.message);
        return of(this.goActionWithPath([ERROR_ROUTE]));
      })
    );
  });

  constructor(
    private projectService: ProjectService,
    private actions$: Actions,
    private loggerService: LoggerService
  ) {}

  private goActionFromProject(project: Project) {
    if (project.status === ProjectStatus.PUBLISHED) {
      return this.goActionWithPath([`projects/${project.id}`]);
    }
    return this.goActionWithPath([LANDING_ROUTE]);
  }

  private goActionWithPath(path: any[]) {
    return new GoAction(path, undefined, { replaceUrl: true });
  }

  private successMessageFromStatus(status: ProjectStatus) {
    let action: string;
    switch (status) {
      case ProjectStatus.PUBLISHED:
      case ProjectStatus.DECLINED:
        action = status.valueOf();
        break;
      default:
        action = 'actioned';
    }

    return `Project successfully ${action}.`;
  }
}
