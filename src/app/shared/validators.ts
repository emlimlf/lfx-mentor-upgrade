// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AbstractControl, FormArray, ValidatorFn } from '@angular/forms';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 20MB
export class CustomValidators {
  // Validates URL
  static url(control: AbstractControl): any {
    if (control.pristine) {
      return null;
    }

    if (!control.value) {
      return null;
    }

    const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?%^#[\]@!\$&'\(\)\*\+,;=.]+$/;
    control.markAsTouched();

    if (URL_REGEXP.test(control.value)) {
      return null;
    }

    return {
      url: true,
    };
  }

  static multiCheckbox = (required: boolean = false, exclusive: number = -1): ValidatorFn => {
    const validate: ValidatorFn = (formArray: AbstractControl) => {
      const values = (<FormArray>formArray).controls.map(({ value }) => value);
      const totalSelected = values.reduce((prev: number, next: boolean) => (next ? prev + +next : prev), 0);

      if (required && totalSelected === 0) {
        return { required: true };
      }

      if (
        exclusive >= 0 &&
        exclusive < values.length &&
        values[exclusive] &&
        values.some((val: boolean, i: number) => i !== exclusive && val)
      ) {
        return { exclusive: true };
      }

      return null;
    };

    return validate;
  };

  static file(extensions: string[], maxSize: number = MAX_FILE_SIZE): any {
    return (control: AbstractControl) => {
      if (!control.value || !control.value.name) {
        return null;
      }

      let ret: any = null;

      if (control.value.size > maxSize) {
        ret = ret || {};
        ret.fileSize = true;
      }

      const parts = control.value.name.split('.'),
        extension = parts[parts.length - 1].toLowerCase();
      extensions = extensions.map(e => e.toLowerCase());
      if (extensions.indexOf(extension) === -1) {
        ret = ret || {};
        ret.fileExtension = true;
      }

      return ret;
    };
  }
}
