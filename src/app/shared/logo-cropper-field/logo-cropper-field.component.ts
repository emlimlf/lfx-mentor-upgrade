// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormGroup, ValidatorFn, FormControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

const MAX_FILE_SIZE_MB = 2;
const BYTES_PER_MB = 1048576;

@Component({
  selector: 'app-logo-cropper-field',
  templateUrl: './logo-cropper-field.component.html',
  styleUrls: ['./logo-cropper-field.component.scss'],
})
export class LogoCropperFieldComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @Input() parent!: FormGroup;
  @Input() label = '';
  @Input() showError = false;
  @Input() previewUrl?: string;
  @Input() defaultLogoUrl = '';

  @Input() control = '';
  @Output() controlChange = new EventEmitter<FormControl>();

  @ViewChild('fileInput', { static: true }) file!: ElementRef;
  readonly width = 1;
  readonly height = 1;
  readonly svgFileExtension = '.svg';

  selectedFile?: File = undefined;
  previewSrc?: string = undefined;
  touched = false;
  focused = false;
  private parentValidatorFn?: ValidatorFn;
  private subscription?: Subscription;
  fileChanged!: boolean;
  imageChangedEvent: any = '';
  croppedImage: any;
  isSVGFile = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    const logoControl = this.logoControl;
    if (logoControl === null) {
      this.previewSrc = undefined;
    } else {
      this.selectedFile = logoControl.value;
      if (this.selectedFile && this.previewUrl === null) {
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

    if ((this.previewSrc === undefined && this.previewUrl !== undefined) || this.logoControl !== null) {
      if (this.logoControl) {
        if (typeof this.logoControl.value === 'string' || this.logoControl.value instanceof String) {
          this.previewSrc = this.logoControl.value as string;
        } else {
          this.previewSrc = this.getPreviewSrc(this.logoControl.value);
        }
      } else {
        this.previewSrc = this.previewUrl;
      }
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

  imageDimensionValidator(file?: File): AsyncValidatorFn {
    return (): any => {
      if (file === undefined) {
        return null;
      }

      return this.checkImageDimension(file).then(
        () => {
          if (
            this.logoControl &&
            (!this.logoControl.errors || this.logoControl.errors.length === 0) &&
            !this.isSVGFile
          ) {
            this.fileChanged = true;
          }
          return null;
        },
        () => {
          this.fileChanged = false;
          return { dimension: true };
        }
      );
    };
  }

  handleFileChange(event: Event) {
    this.fileChanged = false;
    this.isSVGFile = false;
    const logoControl = this.logoControl;
    if (logoControl === null) {
      return;
    }

    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.selectedFile = this.getSelectedFile(target);
    this.setValidators(this.selectedFile);
    this.touched = true;

    this.controlChange.emit(<FormControl>this.logoControl);
    this.imageChangedEvent = event;

    if (this.selectedFile) {
      const extension = /(\.[a-zA-Z]+$)/.exec(this.selectedFile.name);

      if (extension && this.svgFileExtension === extension[0].toLowerCase()) {
        this.isSVGFile = true;
        if (this.logoControl) {
          this.logoControl.setValue(this.selectedFile, { emitEvent: true });
        }
        this.previewSrc = this.getPreviewSrc(this.selectedFile);
        this.fileChanged = false;
      } else {
        this.previewSrc = this.getPreviewSrc(undefined);
        this.imageChangedEvent = event;
      }
    }
  }

  onImageCropped(file: any) {
    this.croppedImage = file;
  }

  onCropperClosed() {
    if (this.logoControl && !this.logoControl.value) {
      this.file.nativeElement.value = null;
      this.selectedFile = undefined;
    }

    this.fileChanged = false;

    if (this.logoControl) {
      if (typeof this.logoControl.value === 'string' || this.logoControl.value instanceof String) {
        this.previewSrc = (this.logoControl.value as string) || this.defaultLogoUrl;
      } else {
        this.previewSrc = this.getPreviewSrc(this.logoControl.value) || this.defaultLogoUrl;
      }
      this.logoControl.setAsyncValidators(null);
    }
  }

  onSaveCroppedImage() {
    if (this.logoControl && this.selectedFile) {
      this.selectedFile = this.blobToFile(this.croppedImage.file, this.selectedFile.name);
      this.logoControl.setValue(this.selectedFile, { emitEvent: true });
      this.previewSrc = this.getPreviewSrc(this.selectedFile);
      this.logoControl.setAsyncValidators(null);
    }
  }

  public blobToFile = (croppedImageBlob: Blob, fileName: string): File => {
    const blob: any = croppedImageBlob;
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return croppedImageBlob as File;
  };

  get logoControl() {
    return this.parent.get(this.control);
  }

  deleteIcon() {
    if (this.logoControl) {
      this.selectedFile = undefined;
      this.logoControl.setValue(this.selectedFile, { emitEvent: true });
      this.previewSrc = this.getPreviewSrc(this.selectedFile);
      this.logoControl.setAsyncValidators(null);
      this.controlChange.emit(<FormControl>this.logoControl);
    }
  }

  private checkImageDimension(file: any) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const image = new Image();
        image.onload = () => {
          if (image.width < this.width || image.height < this.height) {
            reject(null);
          } else {
            resolve(null);
          }
        };
        image.src = <string>fileReader.result;
      };

      fileReader.readAsDataURL(file);
    });
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
    const validators = [
      ...existingValidators,
      this.maxFileSizeValidator(),
      this.fileExtensionValidator(['jpg', 'jpeg', 'png', 'svg']),
    ];
    const asyncValidators = [this.imageDimensionValidator(file)];

    logoControl.setValidators(validators);
    logoControl.setAsyncValidators(asyncValidators);
    logoControl.updateValueAndValidity();
  }

  private maxFileSizeValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      if (this.selectedFile === undefined) {
        return null;
      }
      if (this.selectedFile.size > MAX_FILE_SIZE_MB * BYTES_PER_MB) {
        this.fileChanged = false;
        return { maxFileSize: true };
      }
      return null;
    };
  }

  private fileExtensionValidator(extensions: string[]): ValidatorFn {
    return (): ValidationErrors | null => {
      if (this.selectedFile === undefined) {
        return null;
      }

      let ret: any = null;
      const parts = this.selectedFile.name.split('.');
      const extension = parts[parts.length - 1].toLowerCase();
      extensions = extensions.map(e => e.toLowerCase());
      if (extensions.indexOf(extension) === -1) {
        ret = ret || {};
        ret.fileExtension = true;
      }

      return ret;
    };
  }
}
