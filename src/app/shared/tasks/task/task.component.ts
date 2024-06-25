// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgbDropdown, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskView } from '../tasks/tasks.component';
import { saveAs } from 'file-saver';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FileUploadService } from '@app/core/file-upload.service';
import { TaskService } from '@app/services/task.service';
import { TASK_FILE_EXTENSIONS } from '@app/core/constants';
import { DownloadService } from '@app/services/download.service';
import { factoryLog } from '@app/services/debug.service';
import { TasksHelperService } from '../tasks/tasks-helpers.service';

const log = factoryLog('TaskComponent');

const MAX_FILE_SIZE_MB = 1;
const BYTES_PER_MB = 1048576;

@Component({
  selector: '[app-task]',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  @Input() disableAction = false;
  @Input() editing = false;
  @Input() icon?: string;
  @Input() isAdmin = false;
  @Input() task!: TaskView;

  @Output() edit = new EventEmitter<TaskView>();
  @Output() toggleUpdateStatus = new EventEmitter<TaskView>();
  @Output() updateStatus = new EventEmitter<{ status: string; taskId?: string }>();
  @Output() fileUpdate = new EventEmitter<boolean>();

  @ViewChild('arrow', { static: true }) arrow!: ElementRef<HTMLButtonElement>;
  @ViewChild(NgbDropdown, { static: true }) dropdown!: NgbDropdown;
  @ViewChild('modal', { static: true }) modal?: ElementRef;
  taskFileExtensions = TASK_FILE_EXTENSIONS;

  taskFileData?: File;
  uploading = false;

  message = '';
  constructor(
    private downloadService: DownloadService,
    private fileUploadService: FileUploadService,
    private taskService: TaskService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private tasksHelperService: TasksHelperService
  ) {}
  ngOnInit() {
    this.taskFileData = undefined;

    if (this.task.apprenticeName && !this.icon) {
      this.icon = this.downloadService._defaultLogo({ first: this.task.apprenticeName, last: '' });
    }
  }

  ngOnDestroy() {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }

  onEdit() {
    this.edit.emit(this.task);
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
        // this.activeModal = this.modalService.open(DocViewerComponent, {
        //   centered: true,
        //   windowClass: 'no-border modal-window',
        // });
        break;
    }
  }

  onToggleUpdateStatus() {
    const { dropdown } = this;

    if (dropdown.isOpen()) {
      dropdown.close();
    } else {
      dropdown.open();
      this.toggleUpdateStatus.emit(this.task);
    }

    this.arrow.nativeElement.focus();
  }

  onUpdateStatus(status: string) {
    log('entered onUpdateStatus', { status });

    const required = this.tasksHelperService.taskRequireSubmitFile(this.task);
    const newStatusIsSubmitted = status === 'submitted';
    const isCodingChallenge = this.task.taskName === 'Coding Challenge';
    const fileIsUploaded = this.task.file;

    if (!this.isAdmin && newStatusIsSubmitted && !isCodingChallenge && required && !fileIsUploaded) {
      this.open(`Please upload ${this.task.taskName}`);
      return;
    }

    const { taskId } = this.task;
    this.updateStatus.emit({ status, taskId });
  }

  closeUpdateStatus() {
    if (this.dropdown && this.dropdown.isOpen()) {
      this.dropdown.close();
    }

    if (this.arrow) {
      this.arrow.nativeElement.blur();
    }
  }

  getBadgeType(status: string): string | undefined {
    // switch (status) {
    //   case 'complete':
    //     return 'badge-success';
    //   case 'on-hold':
    //     return 'badge-warning';
    //   case 'incomplete':
    //     return 'badge-light';
    // }
    switch (status) {
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  }

  displayUploadButton() {
    const isSubmitted = this.task.taskStatus === 'submitted';
    const isCompleted = this.task.taskStatus === 'completed';
    if (this.isAdmin || isCompleted || isSubmitted) {
      return false;
    }

    const required = this.tasksHelperService.taskRequireSubmitFile(this.task);
    return required;
  }

  downloadFile(src: any, taskName?: string) {
    const parts = src.split('.');
    const extension = parts[parts.length - 1].toLowerCase();
    saveAs(src, (taskName || 'task_file') + '.' + extension);
  }

  uploadFile(task: any) {
    if (this.taskFileData) {
      this.uploading = true;
      return this.fileUploadService.uploadFile(this.taskFileData).subscribe(
        taskFile => {
          this.uploading = false;
          task.file = taskFile;
          return this.submitTask(task);
        },
        () => {
          this.fileUpdate.emit(false);
          this.uploading = false;
          this.open(`Error while uploading the file`);
        }
      );
    }
  }

  onSelectFile(event: any, task: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      this.taskFileData = event.target.files[0];
      if (this.taskFileData) {
        if (this.taskFileData.size > MAX_FILE_SIZE_MB * BYTES_PER_MB) {
          this.open(`The file should not exceed 1MB`);
          return;
        }

        const parts = this.taskFileData.name.split('.'),
          extension = parts[parts.length - 1].toLowerCase();
        this.taskFileExtensions = this.taskFileExtensions.map(e => e.toLowerCase());
        if (this.taskFileExtensions.indexOf(extension) === -1) {
          this.open(`Only files with .doc, .docx or .pdf extensions are allowed.`);
          return;
        }

        this.fileUpdate.emit(true);
        this.uploadFile(task);
      }
    }
  }

  submitTask(task: any) {
    const updatedTask = {
      id: task.taskId,
      name: task.taskName,
      description: task.taskDescription,
      dueDate: task.taskDueDate,
      status: 'submitted',
      file: task.file,
    };

    this.taskService.updateTask(task.taskId, updatedTask).subscribe(
      res => {
        this.fileUpdate.emit(false);
        this.task.taskUpdatedOn = res.updatedOn;
        if (res.status) {
          this.task.taskStatus = res.status;
        }
        this.open(`File uploaded successfully. Your task has been submitted for review`);
      },
      error => {
        this.fileUpdate.emit(false);
        this.open(`Error while updating the task`);
      }
    );
  }

  simulateClick(taskFile: any) {
    taskFile.value = '';
    taskFile.click();
  }
  uploadText(task: any) {
    if (this.uploading) {
      return 'Uploading ...';
    } else {
      return task.file ? 'Update' : 'Upload';
    }
  }

  formatURL(url: string) {
    let externalURL = url;
    const haveWWW = url.includes('wwww');
    const haveProtocol = url.includes('http');

    if (!haveWWW && !haveProtocol) {
      externalURL = `//${url}`;
    }
    return externalURL;
  }

  open(message: string) {
    this.activeModal = this.modalService.open(this.modal, { centered: true, windowClass: 'no-border modal-window' });
    this.message = message;
  }
}
