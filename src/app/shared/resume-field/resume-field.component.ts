// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomValidators } from '../validators';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocViewerComponent } from '@app/pages/doc-viewer/doc-viewer.component';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-resume-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resume-field.component.html',
  styleUrls: ['./resume-field.component.scss'],
})
export class ResumeFieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() parent!: FormGroup;
  @Input() control = '';
  @Input() resumeLink = '';
  @Input() showError = false;

  selectedFile?: File = undefined;
  touched = false;
  focused = false;
  resumeUploadState = '';
  private parentValidatorFn?: ValidatorFn;
  private subscription?: Subscription;
  activeModal?: NgbActiveModal;
  @ViewChild('filemode', { static: true }) filemode!: ElementRef;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    const resumeControl = this.resumeControl;

    if (resumeControl !== null && this.downloadService.selectedFile !== undefined) {
      this.selectedFile = this.downloadService.selectedFile;
      this.setValidators(this.downloadService.selectedFile);
      resumeControl.setValue(this.downloadService.selectedFile, { emitEvent: false });
    }
  }

  ngAfterViewInit() {
    this.ngOnChanges();
    if (this.downloadService.selectedFile !== undefined) {
      const mode = this.filemode.nativeElement as HTMLElement;
      mode.innerHTML = 'Reset';
    }
  }

  ngOnChanges() {
    const resumeControl = this.resumeControl;
    if (resumeControl === null) {
      return;
    }
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
    this.parentValidatorFn = resumeControl.validator || undefined;
    this.subscription = resumeControl.statusChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  handleBlur(event: Event) {
    if (this.focused) {
      this.touched = true;
    }
  }

  handleClick(event: Event) {
    this.focused = false;
  }

  handleFocus(event: Event) {
    this.focused = true;
  }

  handleFileChange(event: Event) {
    const resumeControl = this.resumeControl;
    if (resumeControl === null) {
      return;
    }
    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.selectedFile = this.getSelectedFile(target);
    this.downloadService.selectedFile = this.selectedFile;
    this.setValidators(this.selectedFile);
    resumeControl.setValue(this.selectedFile, { emitEvent: false });
  }

  get resumeControl() {
    return this.parent.get(this.control);
  }
  toogleResumeState(event: any) {
    event.preventDefault();
    var el = event.target as HTMLElement;
    switch (el.innerText) {
      case 'Change':
        el.innerText = 'Reset';
        break;
      case 'Reset':
        el.innerText = 'Change';
        this.selectedFile = undefined;
        this.downloadService.selectedFile = undefined;
        break;
    }
    this.resumeUploadState = el.innerText;
  }
  downloadFile(file: string = this.resumeLink) {
    const extension = file.substr(file.lastIndexOf('.')).toLowerCase();
    this.downloadService.fileUrl =
      extension === '.pdf' ? file : `https://view.officeapps.live.com/op/embed.aspx?src=${file}`;
    this.downloadService.fileExt = extension;
    switch (extension) {
      case '.doc':
      case '.docx':
        window.open(this.downloadService.fileUrl, '_window');
        break;
      case '.pdf':
        // this.activeModal = this.modalService.open(DocViewerComponent, {
        //   centered: true,
        //   windowClass: 'no-border modal-window',
        // });
        window.open(file, '_window');
        break;
    }
  }

  get hasResume() {
    return this.resumeLink !== '' && this.resumeLink != undefined;
  }
  get hasFile() {
    return this.downloadService.selectedFile !== undefined;
  }
  private getSelectedFile(target: HTMLInputElement) {
    return target === null || target.files === null ? undefined : target.files[0];
  }

  private setValidators(file?: File) {
    const resumeControl = this.resumeControl;
    if (resumeControl === null) {
      return;
    }
    const existingValidators = this.parentValidatorFn === undefined ? [] : [this.parentValidatorFn];
    const validators = [...existingValidators, CustomValidators.file(['pdf', 'doc', 'docx'], 10 * 1024 * 1024)];
    resumeControl.setValidators(validators);
    resumeControl.updateValueAndValidity();
  }
}
