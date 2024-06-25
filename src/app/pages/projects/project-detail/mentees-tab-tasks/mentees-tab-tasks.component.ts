import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-mentees-tab-tasks',
  templateUrl: './mentees-tab-tasks.component.html',
  styleUrls: ['./mentees-tab-tasks.component.scss'],
})
export class MenteesTabTasksComponent implements OnInit, OnChanges {
  @Input() tasks: any[] = [];
  @Input() menteeName = '';
  filteredTasks: any[] = [];
  @Input() hidePerquisiteTasks = false;
  @Output() submittionStatusUpdated = new EventEmitter<any>();
  uniqueId = uuidv4();

  constructor() {}
  ngOnInit(): void {}

  ngOnChanges() {
    this.checkForHidePerquisiteTasks(this.hidePerquisiteTasks);
  }

  onSubmittionStatusUpdated(event: any) {
    this.submittionStatusUpdated.emit(event);
  }

  checkForHidePerquisiteTasks(checked: boolean) {
    if (this.tasks) {
      if (checked) {
        this.filteredTasks = this.tasks.filter(task => task.category && task.category.toLowerCase() !== 'prerequisite');
      } else {
        this.filteredTasks = this.tasks;
      }
    }
  }
}
