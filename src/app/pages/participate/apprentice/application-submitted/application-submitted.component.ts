// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-submitted',
  templateUrl: './application-submitted.component.html',
  styleUrls: ['./application-submitted.component.scss'],
})
export class ApplicationSubmittedComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  submit() {
    this.router.navigate(['/'], { fragment: 'my-tasks' });
  }

  back() {
    this.router.navigate(['']);
  }
}
