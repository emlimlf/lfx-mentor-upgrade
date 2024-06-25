// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mentee-tasks',
  templateUrl: './mentee-tasks.component.html',
  styleUrls: ['./mentee-tasks.component.scss'],
})
export class MenteeTasksComponent implements OnInit {
  menteeId!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const routeId = this.route.snapshot.pathFromRoot[2].params.id as string;
    this.menteeId = routeId.split(',')[0];
  }
}
