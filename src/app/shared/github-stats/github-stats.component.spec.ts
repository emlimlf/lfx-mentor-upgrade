// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GithubStats, LoadingStatus, Project, ProjectStatus } from '@app/core';
import { ProjectsModel } from '@app/projects/state';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject } from 'rxjs';
import { GithubStatsComponent } from './github-stats.component';
import { ShortNumberPipe } from '../short-number.pipe';

describe('GithubStatsComponent', () => {
  let component: GithubStatsComponent;
  let fixture: ComponentFixture<GithubStatsComponent>;
  let projectsModel$: BehaviorSubject<ProjectsModel>;

  beforeEach(async(() => {
    projectsModel$ = new BehaviorSubject<ProjectsModel>({ status: LoadingStatus.LOADING });
    const store = {
      dispatch: jasmine.createSpy('dispatch'),
      select: jasmine.createSpy('select').and.returnValue(projectsModel$)
    };
    TestBed.configureTestingModule({
      declarations: [GithubStatsComponent, ShortNumberPipe],
      providers: [{ provide: Store, useValue: store }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GithubStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the latest project stats', () => {
    const githubStats: GithubStats = {
      stars: 10,
      openIssues: 11,
      forks: 12
    };
    const project: Project = {
      id: '1234',
      ownerId: '1234',
      status: ProjectStatus.PUBLISHED,
      createdOn: new Date(),
      name: 'Dogchain',
      industry: 'Blockchain',
      description: 'The new description',
      color: 'CCCCCC',
      githubStats,
      projectStats: { backers: 0 }
    };
    projectsModel$.next({
      status: LoadingStatus.LOADED,
      project
    });
    expect(component.stats$).toBeObservable(cold('a', { a: githubStats }));
  });

  it('should show nothing if the project is absent', () => {
    projectsModel$.next({
      status: LoadingStatus.LOADING
    });
    expect(component.stats$).toBeObservable(cold('a', { a: undefined }));
  });
});
