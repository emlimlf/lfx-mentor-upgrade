// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Project } from '@app/models/project.model';
import { ProjectService } from '@app/services/project.service';

@Component({
  selector: 'app-submitted-application',
  templateUrl: './submitted-application.component.html',
  styleUrls: ['./submitted-application.component.scss'],
})
export class SubmittedApplicationComponent implements OnInit {
  public newMentor: 'true' | 'false' | null;
  public inviteJoin: 'true' | 'false' | null;
  public inviteDeclined: 'true' | 'false' | null;
  public notAllowed: 'true' | 'false' | null;
  projectId = '';
  joinKey = '';
  project$ = new Subject<Project>();
  project: any = {};
  activeTerms: string[] = [];

  constructor(private router: Router, private activeRoute: ActivatedRoute, private projectService: ProjectService) {
    this.newMentor = 'true';
    this.inviteJoin = 'false';
    this.inviteDeclined = 'false';
    this.notAllowed = 'false';
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.newMentor = params['newMentor'];
      this.inviteJoin = params['joined'];
      this.inviteDeclined = params['decline'];
      this.notAllowed = params['notAllowed'];
    });

    this.activeRoute.params.subscribe(routeParams => {
      this.projectId = routeParams.projectId;
      this.projectService.getProject(this.projectId).subscribe(this.project$);
      this.project$.subscribe(results => {
        this.project = results;
      });
    });
  }

  submit() {
    this.router.navigate(['/'], { fragment: 'my-account' });
  }

  back() {
    this.router.navigate(['']);
  }
}
