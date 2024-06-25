// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, ValidatorFn, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomValidators } from '../validators';

@Component({
  selector: 'app-logo-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo-field.component.html',
  styleUrls: ['./logo-field.component.scss'],
})
export class LogoFieldComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @Input() parent!: FormGroup;
  @Input() label = '';
  @Input() showError = false;
  @Input() previewUrl?: string;

  @Input() control = '';
  @Output() controlChange = new EventEmitter<FormControl>();

  selectedFile?: File = undefined;
  previewSrc?: string = undefined;
  touched = false;
  focused = false;
  private parentValidatorFn?: ValidatorFn;
  private subscription?: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    const logoControl = this.logoControl;
    if (logoControl === null) {
      this.previewSrc = undefined;
    } else {
      this.selectedFile = logoControl.value;
      if (this.selectedFile && !this.previewUrl) {
        this.previewSrc = this.getPreviewSrc(this.selectedFile);
        logoControl.setValue(this.selectedFile, { emitEvent: false });
        this.setValidators(this.selectedFile);
        this.touched = true;

        this.controlChange.emit(<FormControl>this.logoControl);
      }
    }
  }

  ngAfterViewInit() {
    this.ngOnChanges();
  }

  ngOnChanges() {
    const logoControl = this.logoControl;
    if (logoControl === null) {
      return;
    }
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
    this.parentValidatorFn = logoControl.validator || undefined;
    this.subscription = logoControl.statusChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });

    if (!this.previewSrc && this.previewUrl !== undefined) {
      this.previewSrc = this.previewUrl;
      logoControl.updateValueAndValidity();
    }
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
    const logoControl = this.logoControl;
    if (logoControl === null) {
      return;
    }

    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.selectedFile = this.getSelectedFile(target);
    this.previewSrc = this.getPreviewSrc(this.selectedFile);
    logoControl.setValue(this.selectedFile, { emitEvent: false });
    this.setValidators(this.selectedFile);
    this.touched = true;

    this.controlChange.emit(<FormControl>this.logoControl);
  }

  get logoControl() {
    return this.parent.get(this.control);
  }

  private getSelectedFile(target: HTMLInputElement) {
    return target === null || target.files === null ? undefined : target.files[0];
  }

  private getPreviewSrc(file: File | undefined) {
    return file === undefined ? undefined : window.URL.createObjectURL(file);
  }

  private setValidators(file?: File) {
    const logoControl = this.logoControl;
    if (logoControl === null) {
      return;
    }
    const existingValidators = this.parentValidatorFn === undefined ? [] : [this.parentValidatorFn];
    const validators = [...existingValidators, CustomValidators.file(['jpg', 'jpeg', 'png', 'svg'])];
    logoControl.setValidators(validators);
    logoControl.updateValueAndValidity();
  }
}
