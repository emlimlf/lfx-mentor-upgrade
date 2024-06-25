// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AbstractControl, FormGroup } from '@angular/forms';
import { markAsTouchedRecursive } from '@app/core/utilities';

describe('markAsTouchedRecursive', () => {
  function makeControl(...children: AbstractControl[]): AbstractControl {
    return {
      markAsTouched: jasmine.createSpy('markAsTouched'),
      updateValueAndValidity: jasmine.createSpy('updateValueAndValidity'),
      controls: children
    } as any;
  }

  it('marks all child controls as touched', () => {
    const children = [makeControl(), makeControl(), makeControl()];
    const parent = makeControl(...children) as FormGroup;
    markAsTouchedRecursive(parent);
    expect(children[0].markAsTouched).toHaveBeenCalled();
    expect(children[1].markAsTouched).toHaveBeenCalled();
    expect(children[2].markAsTouched).toHaveBeenCalled();
  });
});
