import { EmployerService } from '@app/services/employer.service';
import { AbstractControl } from '@angular/forms';
import { map, catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

export class ValidateEditNameNotTaken {
  static createValidator(employerService: EmployerService, baseName?: string) {
    return (control: AbstractControl) => {
      return employerService.checkCompanyName(control.value).pipe(
        map(isValid => {
          if ( baseName && baseName.trim() === control.value.trim()) {
            return null;
          }
          return isValid ? null : { uniqueName: true };
        }
        ),
        catchError(() => throwError('Error validating company name.'))
      );
    };
  }
}
