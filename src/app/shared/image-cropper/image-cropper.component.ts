import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements AfterViewInit, OnDestroy {
  @Input() imageChangedEvent = '';
  @Input() cropperMinWidth = 420;
  @Input() cropperMinHeight = 420;
  @Input() resizeToWidth = 420;
  @Input() roundCropper = true;
  @Input() isOpen = false;
  @Input() maintainAspectRatio = true;
  @Input() onlyScaleDown = true;

  @Output() imageCropped = new EventEmitter<string>();
  @Output() imageLoaded = new EventEmitter<void>();
  @Output() cropperReady = new EventEmitter<void>();
  @Output() startCropImage = new EventEmitter<void>();
  @Output() loadImageFailed = new EventEmitter<void>();
  @Output() cropperClosed = new EventEmitter<void>();
  @Output() saveCroppedImage = new EventEmitter<void>();

  @ViewChild('content') imageCropper!: ElementRef;
  modalReference!: NgbModalRef;

  constructor(private modalService: NgbModal) { }

  ngAfterViewInit() {
    setTimeout(() =>  this.modalReference = this.modalService.open(
      this.imageCropper, { centered: true, backdrop: 'static', keyboard: false})
      );
  }

  imageCroppedEvent(image: string) {
    this.imageCropped.emit(image);
  }

  imageLoadedEvent() {
    this.imageLoaded.emit();
  }

  cropperReadyEvent() {
    this.cropperReady.emit();
  }

  startCropImageEvent() {
    this.startCropImage.emit();
  }

  loadImageFailedEvent() {
    this.loadImageFailed.emit();
  }

  cropperClosedEvent() {
    this.cropperClosed.emit();
  }

  saveCroppedImageEvent() {
    this.saveCroppedImage.emit();
  }

  onCropperCloseEvent() {
    this.cropperClosed.emit();
  }

  ngOnDestroy() {
    if (this.modalReference) {
      this.modalReference.close();
    }
  }
}
