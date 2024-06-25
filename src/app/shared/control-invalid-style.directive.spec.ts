// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AbstractControl } from '@angular/forms';
import { cold } from 'jasmine-marbles';
import { ControlInvalidStyleDirective } from './control-invalid-style.directive';

describe('StyleControlDirective', () => {
  let control: AbstractControl;

  beforeEach(() => {
    control = {
      invalid: false,
      touched: false,
      statusChanges: cold('abc')
    } as any;
  });

  it('should have "invalid" css class when component is touched and invalid ', () => {
    control = { ...control, invalid: true, touched: true } as any;
    const directive = new ControlInvalidStyleDirective();
    directive.appControlInvalidStyle = control;
    directive.ngOnInit();
    expect(directive.isInvalid).toBeTruthy();
  });
  it('shouldn\'t have "invalid" css class when component is invalid, but not touched ', () => {
    control = { ...control, invalid: true, touched: false } as any;
    const directive = new ControlInvalidStyleDirective();
    directive.appControlInvalidStyle = control;
    directive.ngOnInit();
    expect(directive.isInvalid).toBeFalsy();
  });
});
