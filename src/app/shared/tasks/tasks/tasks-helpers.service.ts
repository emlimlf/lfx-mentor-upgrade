import { Injectable } from '@angular/core';
import { TaskView } from './tasks.component';

export const SUBMIT_FILE_OPTIONS = {
  NO_REQUIRED: 'no-required',
  REQUIRED: 'required',
};

export const PRE_REQUISITE_TASKS_UPLOAD_FILE_REQUIRED = {
  RESUME: 'Resume',
  COVER_LETTER: 'Cover Letter',
  SCHOOL_ENROLLMENT_VERIFICATION: 'School Enrollment Verification',
  PARTICIPATION_PERMISSION_FROM_SCHOOL_OR_EMPLOYER: 'Participation permission from school or employer',
};
export const preRequisiteWithFile = [
  PRE_REQUISITE_TASKS_UPLOAD_FILE_REQUIRED.RESUME,
  PRE_REQUISITE_TASKS_UPLOAD_FILE_REQUIRED.COVER_LETTER,
  PRE_REQUISITE_TASKS_UPLOAD_FILE_REQUIRED.SCHOOL_ENROLLMENT_VERIFICATION,
  PRE_REQUISITE_TASKS_UPLOAD_FILE_REQUIRED.PARTICIPATION_PERMISSION_FROM_SCHOOL_OR_EMPLOYER,
];

export const TASKS_CATEGORIES = {
  PREREQUISITE: 'prerequisite',
  NONPREREQUISITE: 'nonPrerequisite',
};

@Injectable({ providedIn: 'root' })
export class TasksHelperService {
  tasksHasSubmitFileRequired(task: any) {
    if (task.taskCategory === TASKS_CATEGORIES.PREREQUISITE && preRequisiteWithFile.includes(task.taskName)) {
      return true;
    }

    const isRequired = task.submitFile === SUBMIT_FILE_OPTIONS.REQUIRED;
    const isNonPrerequisite = task.taskCategory === TASKS_CATEGORIES.NONPREREQUISITE;
    const submitFileIsNotDefined = !task.submitFile;
    const isExistingTaskBeforeCheckFeature = isNonPrerequisite && submitFileIsNotDefined;

    return isRequired || isExistingTaskBeforeCheckFeature;
  }

  getSubmitFileValueFromCheckbox(checkBoxValue: boolean) {
    if (checkBoxValue) {
      return SUBMIT_FILE_OPTIONS.REQUIRED;
    }
    return SUBMIT_FILE_OPTIONS.NO_REQUIRED;
  }

  taskRequireSubmitFile(task: TaskView) {
    // nonprerequisite & prerequisite
    // if it has submit file required
    return this.tasksHasSubmitFileRequired(task);
  }
}
