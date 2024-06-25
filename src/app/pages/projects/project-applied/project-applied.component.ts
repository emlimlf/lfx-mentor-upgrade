// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-applied',
  templateUrl: './project-applied.component.html',
  styleUrls: ['./project-applied.component.scss'],
})
export class ProjectAppliedComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  submit() {
    this.router.navigate(['/'], { fragment: 'my-tasks' });
  }

  back() {
    this.router.navigate(['']);
  }
}
