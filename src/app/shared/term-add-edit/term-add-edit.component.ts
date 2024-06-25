import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { LocalProgramTerm } from '@app/models/project.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { textFieldLengthObserver } from '@app/core/utilities';

@Component({
  selector: 'app-term-add-edit',
  templateUrl: './term-add-edit.component.html',
  styleUrls: ['./term-add-edit.component.scss'],
})
export class TermAddEditComponent implements OnInit {
  readonly nameLength$: Observable<number>;

  public projectTermsForm: FormGroup;
  termNameLimit = 50;
  saveClicked = false;
  public projectTermsList: LocalProgramTerm[] = [];
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  public itemEdit: LocalProgramTerm = {} as LocalProgramTerm;

  constructor(public activeModal: NgbActiveModal) {
    console.log(this.itemEdit);
    this.projectTermsForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required, Validators.maxLength(this.termNameLimit)]),
        startMonth: new FormControl('', [Validators.required]),
        startYear: new FormControl('', [Validators.required, this.yearValidator, this.currentYearValidator]),
        endMonth: new FormControl('', [Validators.required]),
        endYear: new FormControl('', [Validators.required, this.yearValidator, this.currentYearValidator]),
      },
      this.validateForm.bind(this) as ValidatorFn
    );

    this.nameLength$ = textFieldLengthObserver(this.name);
  }

  ngOnInit() {
    if (this.itemEdit) {
      this.name.patchValue(this.itemEdit.name);
      this.startMonth.patchValue(this.itemEdit.startMonth);
      this.startYear.patchValue(this.itemEdit.startYear);
      this.endMonth.patchValue(this.itemEdit.endMonth);
      this.endYear.patchValue(this.itemEdit.endYear);
    }
  }

  get name() {
    return this.projectTermsForm.get('name') as FormControl;
  }

  get startMonth() {
    return this.projectTermsForm.get('startMonth') as FormControl;
  }

  get startYear() {
    return this.projectTermsForm.get('startYear') as FormControl;
  }

  get endMonth() {
    return this.projectTermsForm.get('endMonth') as FormControl;
  }

  get endYear() {
    return this.projectTermsForm.get('endYear') as FormControl;
  }

  addTerm() {
    this.saveClicked = true;
    if (this.projectTermsForm.valid) {
      const obj: LocalProgramTerm = {
        id: this.itemEdit ? this.itemEdit.id : '',
        name: this.projectTermsForm.controls.name.value || '',
        startMonth: this.projectTermsForm.controls.startMonth.value || '',
        startYear: this.projectTermsForm.controls.startYear.value || '',
        endMonth: this.projectTermsForm.controls.endMonth.value || '',
        endYear: this.projectTermsForm.controls.endYear.value || '',
      };

      this.projectTermsList.push(obj);
      return this.activeModal.close({ status: 1, data: this.projectTermsList });
    }
  }

  yearValidator(control: FormControl | AbstractControl) {
    if (control && control.value !== undefined && control.value !== null) {
      const isValid = control.value.toString().length === 4;
      return isValid ? null : { invalidYearLength: true };
    }
    return null;
  }

  currentYearValidator(control: FormControl | AbstractControl) {
    const today = new Date();
    const year = today.getFullYear();

    if (control && control.value !== undefined && control.value !== null) {
      const isValid = control.value >= year;
      return isValid ? null : { invalidYear: true };
    }
    return null;
  }

  validateForm(state: any) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const startYear = state.controls.startYear;
    const endYear = state.controls.endYear;
    const startMonth = state.controls.startMonth;
    const endMonth = state.controls.endMonth;

    // check the month with year

    if (startYear && endYear && startYear.value <= endYear.value && endYear.value >= year && startYear.value >= year) {
      if (startYear.value === year || +startYear.value === year) {
        // validate end month with the current month
        if (!(this.months.indexOf(startMonth.value) >= month)) {
          return { invalidStartMonth: true, invalidYear: false };
        }
      }

      if (endYear.value === year || +endYear.value === year) {
        // validate end month with the current month
        if (!(this.months.indexOf(endMonth.value) >= month)) {
          return { invalidEndMonth: true, invalidYear: false };
        }
      }

      if (startYear.value === endYear.value || +startYear.value === endYear.value) {
        // validate start month with the end month
        if (!(this.months.indexOf(endMonth.value) > this.months.indexOf(startMonth.value))) {
          return { invalidEndMonth: true, invalidYear: false };
        }
      }

      return null;
    } else {
      // error invalid year sequence
      return { invalidEndYear: true, invalidStartMonth: false, invalidEndMonth: false };
    }
  }

  close() {
    return this.activeModal.close({ status: 0 });
  }
}
