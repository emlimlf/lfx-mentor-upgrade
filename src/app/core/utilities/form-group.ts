// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { FormGroup } from '@angular/forms';

export function markAsTouchedRecursive(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach(control => {
    control.markAsTouched();
    control.updateValueAndValidity();
    if ((control as any).controls !== undefined) {
      markAsTouchedRecursive(control as FormGroup);
    }
  });
}
