// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { SentryService } from '@app/core';
import { SentryEffects } from './sentry.effects';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';

describe('SentryEffects', () => {
  describe('logActionsAsBreadcrumbs$', () => {
    let sentryService: SentryService;

    beforeEach(() => {
      sentryService = jasmine.createSpyObj('SentryService', ['captureException', 'captureBreadcrumb']);
    });

    it('logs the action title for each action', () => {
      const actionTypeOne = 'actionTypeOne';
      const actionTypeTwo = 'actionTypeTwo';
      const actionTypeThree = 'actionTypeThree';

      const input = cold('abc', {
        a: { type: actionTypeOne },
        b: { type: actionTypeTwo },
        c: { type: actionTypeThree }
      });

      const sentryEffects = new SentryEffects(new Actions(input), sentryService);

      expect(sentryEffects.logActionsAsBreadcrumbs$).toBeObservable(input);
      expect(sentryService.captureBreadcrumb).toHaveBeenCalledWith({ message: actionTypeOne });
      expect(sentryService.captureBreadcrumb).toHaveBeenCalledWith({ message: actionTypeTwo });
      expect(sentryService.captureBreadcrumb).toHaveBeenCalledWith({ message: actionTypeThree });
    });
  });
});
