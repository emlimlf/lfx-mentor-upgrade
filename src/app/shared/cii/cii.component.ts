import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const BADGE_URL = environment.API_URL + 'projects/badge/';

@Component({
  selector: 'app-cii',
  templateUrl: './cii.component.html',
  styleUrls: ['./cii.component.scss'],
})
export class CiiComponent implements OnInit {
  _cii!: String;
  ciiStatus!: any;
  ciiProjectID!: String;
  @Output() cii: EventEmitter<String> = new EventEmitter(undefined);
  @Input() showTitle = true;
  @Input() set appCii(outerCii: any) {
    this.ciiProjectID = outerCii;
    this.updateCIIBadge();
  }
  constructor(private http: HttpClient) {}

  ngOnInit() {}

  private updateCIIBadge(): void {
    setTimeout(() => {
      if (!this.ciiProjectID) {
        this.resetStatus();
        return;
      }
      this.http.get(BADGE_URL + this.ciiProjectID).subscribe(
        (value: any) => {
          if (value) {
            this.ciiStatus = value['badge_level'];
            this.cii.emit(this.ciiStatus);
          }
        },
        (error: any) => {
          this.resetStatus();
        }
      );
    });
  }

  private resetStatus() {
    this.ciiStatus = undefined;
    this.cii.emit(this.ciiStatus);
  }
}
