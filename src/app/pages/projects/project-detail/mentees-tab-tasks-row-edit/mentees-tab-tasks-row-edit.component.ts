import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { TasksHelperService } from '@app/shared/tasks/tasks/tasks-helpers.service';
import { TaskService } from '@app/services/task.service';
import { to } from 'await-to-js';
import { factoryLog } from '@app/services/debug.service';
import { IMenteeTask } from '../mentees-tab-tasks-row/mentees-tab-tasks-row.component';
import * as moment from 'moment-timezone';

const log = factoryLog('MenteesTabTasksRowEditComponent');

@Component({
  selector: 'app-mentees-tab-tasks-row-edit',
  templateUrl: './mentees-tab-tasks-row-edit.component.html',
  styleUrls: ['./mentees-tab-tasks-row-edit.component.scss'],
})
export class MenteesTabTasksRowEditComponent implements OnInit {
  @Input() task: IMenteeTask = null as any;
  @Output() updated: EventEmitter<any> = new EventEmitter();

  form: FormGroup;
  taskName: FormControl;
  taskDueDate: FormControl;
  taskDescription: FormControl;
  submitFile: FormControl;
  taskStatus: FormControl;
  isLoading = false;

  taskSubmitted = false;
  currentDate = new Date();

  constructor(
    private tasksHelperService: TasksHelperService,
    private taskService: TaskService,
    private ngbDateParserFormatter: NgbDateParserFormatter
  ) {
    this.form = new FormGroup({
      taskName: new FormControl('', Validators.required),
      taskDueDate: new FormControl('', this.dueDateValidator()),
      taskDescription: new FormControl('', Validators.required),
      submitFile: new FormControl(''),
      taskFile: new FormControl(''),
      taskStatus: new FormControl(''),
    });

    this.taskName = this.form.controls['taskName'] as FormControl;
    this.taskDueDate = this.form.controls['taskDueDate'] as FormControl;
    this.taskDescription = this.form.controls['taskDescription'] as FormControl;
    this.taskStatus = this.form.controls['taskStatus'] as FormControl;
    this.submitFile = this.form.get('submitFile') as FormControl;
  }

  getDateInSimpleFormat(value = '') {
    if (!value) {
      return '';
    }

    const simpleFormat = new RegExp('.+-.+-.+');

    if (simpleFormat.test(value)) {
      return value;
    }

    return moment(new Date(value).toISOString()).format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    log('entered oninit', { task: this.task });

    this.taskName.setValue(this.task.name);
    this.taskDueDate.reset();
    this.taskDescription.setValue(this.task.description);
    this.taskStatus.setValue(this.task.status);
    const submitFileValue = this.tasksHelperService.tasksHasSubmitFileRequired(this.task);
    this.submitFile.setValue(submitFileValue);

    if (this.task.dueDate) {
      const date = this.getDateInSimpleFormat(this.task.dueDate);

      this.taskDueDate.setValue({
        year: this.ngbDateParserFormatter.parse(date).year,
        month: this.ngbDateParserFormatter.parse(date).month,
        day: this.ngbDateParserFormatter.parse(date).day,
      });
    }
  }

  cancel() {
    this.updated.emit(null);
  }

  closePicker(taskDueDatePicker: any) {
    taskDueDatePicker.close();
  }

  async onSubmitEditTask() {
    this.taskSubmitted = true;
    if (!this.form.valid || !this.task) {
      return;
    }

    this.isLoading = true;

    const task = {
      id: this.task.id,
      name: this.taskName.value,
      description: this.taskDescription.value,
      dueDate: this.ngbDateParserFormatter.format(this.taskDueDate.value),
      status: this.taskStatus.value,
      submitFile: this.tasksHelperService.getSubmitFileValueFromCheckbox(this.submitFile.value),
    };

    log('task to update ', { task });

    this.taskSubmitted = false;
    const [err, updated] = await to(this.taskService.updateTask(this.task.id, task).toPromise());
    if (err) {
      this.isLoading = false;
      return;
    }

    this.updated.emit(updated);
    this.isLoading = false;
  }

  private dueDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      if (typeof control.value !== 'object') {
        return { invalidDueDateTemplate: { value: control.value } };
      }

      const actualDueDate = new Date(this.ngbDateParserFormatter.format(control.value));
      if (actualDueDate < this.currentDate && actualDueDate.toDateString() !== this.currentDate.toDateString()) {
        return { invalidDueDate: { value: control.value } };
      }

      return null;
    };
  }
}
