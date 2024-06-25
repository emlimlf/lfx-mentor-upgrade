import { to } from 'await-to-js';
import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { factoryLog } from '@app/services/debug.service';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '@app/services/task.service';
import { DownloadService } from '@app/services/download.service';
import { MenteesTabTasksRowEditComponent } from '../mentees-tab-tasks-row-edit/mentees-tab-tasks-row-edit.component';
import moment from 'moment';

const log = factoryLog('MenteesTabTasksRowComponent');

export interface IMenteeTask {
  applicationStatus: string;
  assigneeId: string;
  category: string;
  createdBy: string;
  createdOn: string;
  custom: string;
  description: string;
  id: string;
  name: string;
  ownerId: string;
  programTermId: string;
  programTermStatus: string;
  projectId: string;
  status: string;
  submitFile: string;
  updatedOn: string;
  dueDate: string;
  file?: any;
  taskName: string;
}

@Component({
  selector: 'app-mentees-tab-tasks-row',
  templateUrl: './mentees-tab-tasks-row.component.html',
  styleUrls: ['./mentees-tab-tasks-row.component.scss'],
})
export class MenteesTabTasksRowComponent implements OnInit {
  @Input() task: IMenteeTask = null as any;
  // @todo: Get admin from parent
  @Input() isAdmin = true;
  @Output() submittionStatusUpdated = new EventEmitter<any>();

  menteeGraduated = false;
  disableAction = false;
  isEditAllowed = false;

  @ViewChild(NgbDropdown) dropdown!: NgbDropdown;
  @ViewChild('arrow') arrow!: ElementRef<HTMLButtonElement>;

  constructor(
    private taskService: TaskService,
    private modalService: NgbModal,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    log(' entered oninit');
    this.menteeGraduated = this.task.applicationStatus === 'graduated';
    this.isEditAllowed = this.task.category !== 'prerequisite';

    // Fixes date issue on firefox.
    if (this.task) {
      this.task.createdOn = new Date(this.task.createdOn.replace(/-/g, '/') || '').toString();
      this.task.updatedOn = new Date(this.task.updatedOn.replace(/-/g, '/') || '').toString();
      if (this.task.dueDate) {
        this.task.dueDate = new Date(this.task.dueDate.replace(/-/g, '/') || '').toString();
      }
    }
  }

  getBadgeType(status = '') {
    switch (status) {
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  }

  toggleButton() {
    if (this.dropdown.isOpen()) {
      this.dropdown.close();
    } else {
      this.dropdown.open();
    }
  }

  async onUpdateStatus(status = '') {
    this.disableAction = true;
    const [err, updated] = await to(this.taskService.updateTaskStatus(this.task.id, status).toPromise());
    if (err) {
      // @todo: handle error
      this.disableAction = false;
      return;
    }

    const [taskErr, response] = await to(this.taskService.getSubmittedAssignees(this.task.projectId).toPromise());
    let result = response ? response : [];
    if (taskErr || !result) {
      log('error ', { taskErr });
      return;
    }
    this.submittionStatusUpdated.emit(result);

    log('updated', { updated });
    this.disableAction = false;

    this.task.status = status;
    this.task.updatedOn = moment().format('YYYY-MM-DD hh:mm:ss +0000');

    return true;
  }

  async editTask() {
    const modalRef = this.modalService.open(MenteesTabTasksRowEditComponent, {
      ariaLabelledBy: 'Edit Task',
      windowClass: 'task-modal',
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.task = this.task;
    modalRef.componentInstance.updated.subscribe(
      (updateTask: any) => {
        if (!updateTask) {
          modalRef.close();
          return;
        }

        this.task = { ...updateTask };
        modalRef.close();
      },
      (err: any) => log('error', { err })
    );
  }

  downloadFile(src: any, taskName?: string) {
    const parts = src.split('.');
    const extension = parts[parts.length - 1].toLowerCase();
    saveAs(src, (taskName || 'task_file') + '.' + extension);
  }

  viewFile(file: string) {
    const extension = file.substr(file.lastIndexOf('.')).toLowerCase();
    this.downloadService.fileUrl =
      extension === '.pdf' ? file : `https://view.officeapps.live.com/op/embed.aspx?src=${file}`;
    this.downloadService.fileExt = extension;
    switch (extension) {
      case '.doc':
      case '.docx':
        window.open(this.downloadService.fileUrl, '_blank');
        break;
      case '.pdf':
        window.open(file, '_blank');
        break;
    }
  }
}
