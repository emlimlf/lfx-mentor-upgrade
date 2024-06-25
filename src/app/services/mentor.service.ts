// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpParams, HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProjectResponse, MentorMenteesResponse } from '@app/models/project.model';
import { environment } from '@app/../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MentorService {
  constructor(private http: HttpClient) {}

  getMentorProjects(mentor: string, limit?: string, nextPageKey?: string): Observable<ProjectResponse> {
    let params = new HttpParams();

    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!limit && +limit > 0) {
      // Check to see if the limit is a positive integer...
      if (+limit > 9) {
        // ...and cap the max number of projects at 9.
        limit = '9';
      }
      params = params.append('limit', limit);
    }
    return this.http
      .get<ProjectResponse>(environment.API_URL + 'mentors/' + mentor + '/projects', { params: params })
      .pipe(catchError(this.handleError));
  }

  getMentorApprentices(
    mentor: string,
    limit?: string,
    status?: string,
    nextPageKey?: string
  ): Observable<MentorMenteesResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!limit && +limit > 0) {
      params = params.append('limit', limit);
    }
    if (!!status) {
      params = params.append('status', status);
    }
    return this.http
      .get<MentorMenteesResponse>(environment.API_URL + 'mentors/' + mentor + '/apprentices', { params: params })
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
