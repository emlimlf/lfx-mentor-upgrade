// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TaskComponent } from '../task/task.component';
import { TaskView, ApprenticeProjectTasksSection } from '../tasks/tasks.component';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

// type TaskStatus = 'complete' | 'incomplete' | 'on-hold';
type TaskStatus = 'pending' | 'inProgress' | 'submitted ' | 'completed';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.scss'],
})
export class TaskGroupComponent implements OnInit {
  @Input() disableAction = false;
  @Input() hideTitle = false;
  @Input() isFiltered = false;
  @Input() isMaintainerAdmin = false;
  @Input() isMentor = false;
  @Input() isApprentice = false;
  @Input() color = '#CCCCCC';
  @Input() icon!: string;
  @Input() tasks!: TaskView[];
  @Input() title!: string;
  @Input() avatarUrl?: string;
  @Input() avatarText?: string;
  @Input() editing?: string;
  @Input() groupBy?: string;
  @Input() status?: string;
  @Input() activeMentees?: ApprenticeProjectTasksSection[];
  @Input() displayProjectTasksDetails = true;

  @Output() addTask = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<TaskView>();
  @Output() updateStatus = new EventEmitter<{ taskStatus: TaskStatus; taskId: string }>();
  @Output() fileUpdate = new EventEmitter<boolean>();

  @ViewChildren(TaskComponent) taskViews!: TaskComponent[];

  get isAdmin(): boolean {
    return this.isMentor || this.isMaintainerAdmin;
  }

  get hasAnyActiveMentee(): boolean {
    if (this.activeMentees == undefined) {
      return true;
    }
    return this.activeMentees.length > 0;
  }

  toggleProjectTaskDetails() {
    this.displayProjectTasksDetails = !this.displayProjectTasksDetails;
  }

  ngOnInit() {}

  onAddTask() {
    this.addTask.emit();
  }

  onEditTask(task: TaskView) {
    this.editTask.emit(task);
  }

  onToggleUpdateStatus(targetTask: TaskView) {
    this.taskViews.filter(task => task.task !== targetTask).forEach(task => task.closeUpdateStatus());
  }

  onUpdateStatus(taskId: string, taskStatus: TaskStatus) {
    this.updateStatus.emit({ taskStatus, taskId });
  }

  constructor() {}
}
