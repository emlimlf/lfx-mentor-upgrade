// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project, ProjectApplication, ProjectResponse } from '@app/models/project.model';
import { MentorResponse, MentorUser, MenteeResponse } from '@app/models/user.model';
import { AuthService } from './auth.service';
import { TaskService } from './task.service';
import { environment } from '../../environments/environment';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenteeService {
  constructor(private authService: AuthService, private http: HttpClient, private taskService: TaskService) {}

  getMenteeActiveProjects(
    menteeId: string,
    limit?: number,
    nextPageKey?: string,
    isActive = true,
    isCardQuery?: boolean
  ): Observable<ProjectResponse> {
    let params = new HttpParams();

    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!isCardQuery) {
      const queryMode = isCardQuery ? 'true' : 'false';
      params = params.append('isCardQuery', queryMode);
    }
    if (typeof limit === 'number') {
      params = params.append('limit', limit.toString());
    }
    if (isActive) {
      params = params.append('userStatus', 'active');
    }

    let projects$: Observable<ProjectResponse> = this.http.get<ProjectResponse>(
      environment.API_URL + 'mentees/' + menteeId + '/projects',
      { params }
    );

    return projects$.pipe(catchError(this.handleError));
  }

  getMenteePrivateProjects(menteeId: string, limit?: number, nextPageKey?: string): Observable<ProjectResponse> {
    let params = new HttpParams();

    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (typeof limit === 'number') {
      params = params.append('limit', limit.toString());
    }
    const projects$: Observable<ProjectResponse> = this.http.get<ProjectResponse>(
      environment.API_URL + 'mentees/' + menteeId + '/private-projects',
      { params }
    );
    return projects$.pipe(catchError(this.handleError));
  }

  getMenteePublicProjects(menteeId: string, limit?: number): Observable<ProjectResponse> {
    let params = new HttpParams();
    if (typeof limit === 'number') {
      params = params.append('limit', limit.toString());
    }
    const projects$: Observable<ProjectResponse> = this.http.get<ProjectResponse>(
      environment.API_URL + 'mentees/' + menteeId + '/projects',
      { params }
    );
    return projects$.pipe(catchError(this.handleError));
  }

  getMenteePublicProjectsWithNoLimit(menteeId: string): Observable<ProjectResponse> {
    const projects$: Observable<ProjectResponse> = this.http.get<ProjectResponse>(
      environment.API_URL + 'mentees/' + menteeId + '/projects-nolimit'
    );
    return projects$.pipe(catchError(this.handleError));
  }

  getMenteeMentors(
    menteeId: string,
    limit?: number,
    nextPageKey?: string,
    projectId?: string,
    isCardQuery?: boolean
  ): Observable<MentorResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!projectId) {
      params = params.append('projectId', projectId);
    }
    if (!!isCardQuery) {
      const queryMode = isCardQuery ? 'true' : 'false';
      params = params.append('isCardQuery', queryMode);
    }
    if (typeof limit === 'number') {
      params = params.append('limit', limit.toString());
    }

    return this.http
      .get<MentorResponse>(environment.API_URL + 'mentees/' + menteeId + '/mentors', { params })
      .pipe(catchError(this.handleError));
  }

  getMentorProfile(mentorId: string): Observable<MentorUser> {
    //https://mori-dev.people.dev.platform.linuxfoundation.org/mentors/f3477675-e180-4c73-9708-d1393a8bd5a0/profile/mentor
    return this.http
      .get<MentorUser>(environment.API_URL + 'mentors/' + mentorId + '/profile/mentor')
      .pipe(catchError(this.handleError));
  }

  private ammendTasksToMentee(menteeId: string): (projectResponse: ProjectResponse) => Observable<ProjectResponse> {
    return (projectResponse: ProjectResponse): Observable<ProjectResponse> => {
      let ammendProjects$: Observable<Project[]>;

      if (projectResponse.projects.length) {
        ammendProjects$ = forkJoin(
          projectResponse.projects
            .filter(project => {
              const onlyIncludes = ['accepted', 'pending', 'approved', 'graduated'];
              return onlyIncludes.includes(project.menteeStatus || '');
            })
            .map(project =>
              this.taskService.getTasks(menteeId, undefined, undefined, project.projectId).pipe(
                tap(({ tasks }) => (project.tasks = [...(tasks || [])])),
                map(() => project)
              )
            )
        );
      } else {
        ammendProjects$ = of([...projectResponse.projects]);
      }

      return ammendProjects$.pipe(map(projects => ({ projects, nextPageKey: projectResponse.nextPageKey })));
    };
  }

  getMenteeApplications(menteeId: string): Observable<ProjectApplication[]> {
    return this.http
      .get<ProjectApplication[]>(environment.API_URL + 'mentees/' + menteeId + '/applications')
      .pipe(catchError(this.handleError));
  }
  getMenteeEndApplications(menteeId: string): Observable<ProjectApplication[]> {
    return this.http
      .get<ProjectApplication[]>(environment.API_URL + 'mentees/' + menteeId + '/applications?programTermStatus=closed')
      .pipe(catchError(this.handleError));
  }

  withdrawMenteeProject(menteeId: string, projectId: string) {
    return this.http
      .put<MentorResponse>(
        environment.API_URL + 'mentees/' + menteeId + '/project/' + projectId + '/withdraw',
        undefined
      )
      .pipe(catchError(this.handleError));
  }

  getMentees(limit?: string, nextPageKey?: string, filter?: string): Observable<MenteeResponse> {
    let params = new HttpParams();
    if (!!limit) {
      params = params.append('limit', limit);
    }
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!filter) {
      params = params.append('filter', filter);
    }

    return this.http
      .get<MenteeResponse>(environment.API_URL + 'mentees/', { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      return throwError(error);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
