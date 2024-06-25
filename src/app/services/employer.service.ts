// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';

import { FileUploadService } from '../core/file-upload.service';
import { Employer, Job, EmployerResponse } from '../models/employer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployerService {
  constructor(private http: HttpClient, private fileUploadService: FileUploadService) {}

  addEmployer(employer: Employer): Observable<Employer> {
    console.log('addEmployer', employer);
    const route = environment.API_URL + 'employers/';
    const uploadlogoIfNeeded$ =
      typeof employer.logoUrl === 'string' || employer.logoUrl === undefined
        ? of(employer)
        : this.fileUploadService
            .uploadFile(employer.logoUrl)
            .pipe(map((logoUrl: string) => ({ ...employer, logoUrl })));
    return uploadlogoIfNeeded$.pipe(
      flatMap((employerWithLogoUrlPath: Employer) => this.http.post<Employer>(route, employerWithLogoUrlPath))
    );
  }

  getEmployer(employerId: string): Observable<Employer> {
    const route = environment.API_URL + 'employers/' + employerId;

    return this.http.get<Employer>(route).pipe(catchError(this.handleError));
  }

  checkCompanyName(companyName: string) {
    const route = `${environment.API_URL}employers/check-company-name`;

    return this.http
      .post<boolean>(route, { companyName })
      .pipe(catchError(this.handleError));
  }

  getEmployers(
    limit?: string,
    nextPageKey?: string,
    userId?: string,
    status?: string,
    filter?: string
  ): Observable<EmployerResponse> {
    let params = new HttpParams();

    if (!!limit) {
      params = params.append('limit', limit);
    }
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!userId) {
      params = params.append('userId', userId);
    }
    if (!!status) {
      params = params.append('status', status);
    }
    if (!!filter) {
      params = params.append('filter', filter);
    }

    const route = environment.API_URL + 'employers';

    return this.http
      .get<EmployerResponse>(route, { params })
      .pipe(catchError(this.handleError));
  }

  addJobToEmployer(employerId: string, job: Job): Observable<Job> {
    console.log('addJobToEmployer', employerId, job);
    return this.http
      .post<Job>(environment.API_URL + 'employers/' + employerId + '/jobs', job)
      .pipe(catchError(this.handleError));
  }

  getJobsForEmployer(employerId: string): Observable<Job[]> {
    return this.http
      .get<Job[]>(environment.API_URL + 'employers/' + employerId + '/jobs')
      .pipe(catchError(this.handleError));
  }

  updateEmployerProfile(update: Employer): Observable<any> {
    const { id } = update;
    const route = `${environment.API_URL}employers/${id}`;

    return this.uploadLogoIfNeeded(update).pipe(
      flatMap((employerWithLogoUrlPath: Employer) => this.http.put<Employer>(route, employerWithLogoUrlPath))
    );
  }

  private uploadLogoIfNeeded(employer: Employer): Observable<Employer> {
    const { logoUrl } = employer;

    if (typeof logoUrl === 'string' || logoUrl === undefined) {
      return of(employer);
    }

    return this.fileUploadService.uploadFile(logoUrl).pipe(map((logoUrl: string) => ({ ...employer, logoUrl })));
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
