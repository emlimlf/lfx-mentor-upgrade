import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export function textFieldLengthObserver(control: AbstractControl): Observable<number> {
  return control.valueChanges.pipe(
    map(value => textFieldLength(value)),
    startWith(textFieldLength(control.value))
  );

  function textFieldLength(value: string): number {
    return value.length;
  }
}
