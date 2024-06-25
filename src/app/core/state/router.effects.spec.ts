// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { BackAction, ForwardAction, GoAction } from './router.actions';
import { RouterEffects } from './router.effects';

describe('RouterEffects', () => {
  let router: Router;
  let location: Location;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    location = jasmine.createSpyObj('Location', ['back', 'forward']);
  });
  describe('navigate$', () => {
    it('updates the location when a GoAction is sent', () => {
      const path = ['some-path'];
      const input = cold('a', { a: new GoAction(path) });
      const effects = new RouterEffects(new Actions(input), router, location);
      expect(effects.navigate$).toBeObservable(input);
      expect(router.navigate).toHaveBeenCalledWith(path, { queryParams: undefined });
    });
  });
  describe('navigateBack$', () => {
    it('calls location.back when a BackAction is sent', () => {
      const input = cold('a', { a: new BackAction() });
      const effects = new RouterEffects(new Actions(input), router, location);
      expect(effects.navigateBack$).toBeObservable(input);
      expect(location.back).toHaveBeenCalled();
    });
  });
  describe('navigateForward$', () => {
    it('calls location.forward when a ForwardAction is sent', () => {
      const input = cold('a', { a: new ForwardAction() });
      const effects = new RouterEffects(new Actions(input), router, location);
      expect(effects.navigateForward$).toBeObservable(input);
      expect(location.forward).toHaveBeenCalled();
    });
  });
});
