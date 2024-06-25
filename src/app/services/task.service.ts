// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Task, TaskResponse } from '../models/project.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  route: string = environment.API_URL + 'tasks';
  params: HttpParams = new HttpParams();
  submittedSubject = new BehaviorSubject<any>(null);
  statusControls: HTMLSpanElement[] = [];
  submittedStatuses$ = this.submittedSubject as Observable<any>;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTasks(
    assigneeId?: string,
    ownerId?: string,
    status?: string,
    projectId?: string,
    nextPageKey?: string
  ): Observable<TaskResponse> {
    let params: HttpParams = new HttpParams();

    if (!!assigneeId) {
      params = params.append('assigneeId', assigneeId);
    }
    if (!!ownerId) {
      params = params.append('ownerId', ownerId);
    }
    if (!!status) {
      params = params.append('status', status);
    }
    if (!!projectId) {
      params = params.append('projectId', projectId);
    }
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }

    return this.http
      .get<TaskResponse>(this.route, { params })
      .pipe(catchError(this.handleError));
  }

  getSubmittedAssignees(projectId: string): Observable<string[]> {
    let params: HttpParams = new HttpParams();
    if (!!projectId) {
      params = params.append('projectId', projectId);
    }
    return this.http
      .get<string[]>(this.route + '/submitted', { params })
      .pipe(catchError(this.handleError));
  }

  getCurrentTasks(assigneeId?: string, projectId?: string): Observable<TaskResponse> {
    let params: HttpParams = new HttpParams();

    if (!!assigneeId) {
      params = params.append('assigneeId', assigneeId);
    }
    if (!!projectId) {
      params = params.append('projectId', projectId);
    }
    return this.http
      .get<TaskResponse>(this.route + '/current-tasks', { params })
      .pipe(catchError(this.handleError));
  }

  getMenteeCurrentTasks(assigneeId?: string, projectId?: string): Observable<TaskResponse> {
    let params: HttpParams = new HttpParams();

    if (assigneeId) {
      params = params.append('assigneeId', assigneeId);
    }
    if (projectId) {
      params = params.append('projectId', projectId);
    }
    return this.http
      .get<TaskResponse>(this.route + '/mentee-current-tasks', { params })
      .pipe(catchError(this.handleError));
  }

  createTask(task: Task): Observable<any> {
    return this.http.post(this.route, task).pipe(catchError(this.handleError));
  }

  updateTask(id: string, updatedData: Task): Observable<Task> {
    return this.http.put<Task>(this.route + '/' + id, updatedData).pipe(catchError(this.handleError));
  }

  updateTaskStatus(id: string, statusString: string): Observable<Task> {
    return this.http
      .put<Task>(this.route + '/' + id, { status: statusString })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a employer-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
