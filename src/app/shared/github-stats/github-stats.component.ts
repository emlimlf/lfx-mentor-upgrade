// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
// import { Component, Input, OnInit } from '@angular/core';
// import { CoreState, GithubStats } from '@app/core';
// // import { createOverviewSelector, ProjectsModel } from '@app/projects/state';
// import { Store } from '@ngrx/store';
// import { Observable, of } from 'rxjs';
// import { map } from 'rxjs/operators';

// const DEFAULT_ICON_COLOR = '#FFFFFF';

// @Component({
//   selector: 'app-github-stats',
//   templateUrl: './github-stats.component.html',
//   styleUrls: ['./github-stats.component.scss']
// })
// export class GithubStatsComponent implements OnInit {
//   @Input() projectId = '';

//   stats$: Observable<GithubStats | undefined> = of(undefined);
//   iconColor$: Observable<string> = of('#000000');

//   constructor(private store: Store<CoreState>) {}

//   ngOnInit() {
//     const projectModel$ = this.store.select(createOverviewSelector(this.projectId));
//     this.stats$ = projectModel$.pipe(map(projectModal => this.getStatsFromModel(projectModal)));
//     this.iconColor$ = projectModel$.pipe(map(project => this.getColorFromModel(project)));
//   }

//   private getColorFromModel(projectModal: ProjectsModel): string {
//     const { project } = projectModal;
//     if (project === undefined) {
//       return DEFAULT_ICON_COLOR;
//     }
//     return `#${project.color}`;
//   }

//   private getStatsFromModel(projectModal: ProjectsModel): GithubStats | undefined {
//     const { project } = projectModal;
//     if (project === undefined) {
//       return undefined;
//     }
//     return project.githubStats;
//   }
// }
