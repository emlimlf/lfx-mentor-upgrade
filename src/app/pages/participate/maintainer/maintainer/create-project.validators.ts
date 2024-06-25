import { AbstractControl } from '@angular/forms';
import { map, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ProjectService } from '@app/services/project.service';

export class ValidateTitleNotTaken {
  static createValidator(projectService: ProjectService) {
    return (control: AbstractControl) => {
      return projectService.checkTitle(control.value).pipe(
        map(isValid => (isValid ? null : { uniqueTitle: false })),
        catchError(() => throwError('Some error occurred'))
      );
    };
  }
}
