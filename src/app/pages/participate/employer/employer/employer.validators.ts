import { EmployerService } from '@app/services/employer.service';
import { AbstractControl } from '@angular/forms';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { Employer } from '@app/models/employer.model';

export class ValidateNameNotTaken {
  static createValidator(employerService: EmployerService) {
    return (control: AbstractControl) => {
      return employerService.checkCompanyName(control.value).pipe(
        map(isValid => (isValid ? null : { uniqueName: true })),
        catchError(() => throwError('Error validating company name.'))
      );
    };
  }
}
