import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DownloadService } from '@app/services/download.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.css'],
})
export class DocViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  docUrl: any;

  $unsubscribe = new Subject<void>();
  $loadstate = new BehaviorSubject<boolean>(false);

  constructor(
    public downloadService: DownloadService,
    public sanitizer: DomSanitizer,
    public activeModal: NgbActiveModal
  ) {}
  ngAfterViewInit(): void {}
  frameLoaded(event: any) {
    return event;
  }
  ngOnInit() {
    this.downloadService.$documentLoadState.next(true);
    this.downloadService.$documentLoadState.subscribe(this.$loadstate as any);
    this.docUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.downloadService.fileUrl as string);
  }

  ngOnDestroy() {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  close() {
    return this.activeModal.close({ status: 0 });
  }
}
