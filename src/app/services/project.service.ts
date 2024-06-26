// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { EmployerResponse } from '@app/models/employer.model';
import { Profile } from '@app/models/user.model';
import { AuthService } from '@app/services/auth.service';
import { environment } from '../../environments/environment';
import { FileUploadService } from '../core/file-upload.service';
import { factoryLog } from '@app/services/debug.service';
import {
  Project,
  ProjectJob,
  ProjectMember,
  ProjectResponse,
  MentorResponse,
  MenteeResponse,
  ExpiredApplication,
  MenteeCSVResponse,
} from '@app/models/project.model';

const log = factoryLog('ProjectService');
const BADGE_ENDPOINT = 'https://bestpractices.coreinfrastructure.org/projects/{id}/badge.json';
const BADGE_URL = environment.API_URL + 'projects/badge/';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  public static isClickAction$ = new BehaviorSubject<Boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fileUploadService: FileUploadService
  ) {}

  addProject(project: Project): Observable<Project> {
    const uploadlogoIfNeeded$ =
      typeof project.logoUrl === 'string' || project.logoUrl === undefined
        ? of(project)
        : this.fileUploadService.uploadFile(project.logoUrl).pipe(map((logoUrl: string) => ({ ...project, logoUrl })));
    return uploadlogoIfNeeded$.pipe(
      mergeMap((projectWithLogoURLPath: Project) =>
        this.http.post<Project>(environment.API_URL + 'projects', projectWithLogoURLPath)
      )
    );
  }

  checkBadge(ciiProjectId: string): Promise<boolean> {
    let exists: Promise<boolean> = <Promise<boolean>>this.http
      .get(BADGE_URL + ciiProjectId)
      .toPromise()
      .then((result: any) => {
        return result['badge_level'] === undefined ? false : true;
      })
      .catch(err => {
        return false;
      });
    return exists;
  }

  getBadgeRoute(id: string) {
    return BADGE_ENDPOINT.replace('{id}', id);
  }
  updateProject(project: Project): Observable<Project> {
    const uploadlogoIfNeeded$ =
      typeof project.logoUrl === 'string' || project.logoUrl === undefined
        ? of(project)
        : this.fileUploadService.uploadFile(project.logoUrl).pipe(map((logoUrl: string) => ({ ...project, logoUrl })));
    return uploadlogoIfNeeded$.pipe(
      mergeMap((projectWithLogoURLPath: Project) =>
        this.http.put<Project>(environment.API_URL + 'projects/' + project.projectId, projectWithLogoURLPath)
      )
    );
  }

  updateAcceptApplicationsFlag(projectId: string, flag: boolean) {
    const requestBody = {
      acceptApplications: flag,
    };
    return this.http.put<Project>(environment.API_URL + 'projects/' + projectId + '/accept-applications', requestBody);
  }

  getProjects(
    userRole?: string,
    limit?: string,
    nextPageKey?: string,
    filter?: string,
    programTermStatus?: string,
    acceptApplications?: string
  ): Observable<ProjectResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!limit) {
      params = params.append('limit', limit);
    }
    if (!!filter) {
      params = params.append('filter', filter);
    }
    if (!!programTermStatus) {
      params = params.append('programTermStatus', programTermStatus);
    }
    if (!!acceptApplications) {
      params = params.append('acceptApplications', acceptApplications);
    }

    switch (userRole) {
      case 'maintainer': {
        return this.http
          .get<ProjectResponse>(environment.API_URL + 'projects/maintainer', { params })
          .pipe(catchError(this.handleError));
      }
      case 'mentor': {
        return this.http
          .get<ProjectResponse>(environment.API_URL + 'projects/mentor', { params })
          .pipe(catchError(this.handleError));
      }
      default: {
        return this.http
          .get<ProjectResponse>(environment.API_URL + 'projects', { params })
          .pipe(catchError(this.handleError));
      }
    }
  }

  getProjectsBySkill(skillName: string): Observable<Project[]> {
    return this.http
      .get<Project[]>(environment.API_URL + 'projects/skill/' + skillName)
      .pipe(catchError(this.handleError));
  }

  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(environment.API_URL + 'projects/' + projectId).pipe(catchError(err => of(err)));
  }

  getPrivateProject(projectId: string): Observable<Project> {
    return this.http
      .get<Project>(environment.API_URL + 'projects/' + projectId + '/private')
      .pipe(catchError(this.handleError));
  }

  getProjectJobs(projectId: string): Observable<ProjectJob[]> {
    return this.http
      .get<ProjectJob[]>(environment.API_URL + 'projects/' + projectId + '/job')
      .pipe(catchError(this.handleError));
  }

  getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http
      .get<ProjectMember[]>(environment.API_URL + 'projects/' + projectId + '/member')
      .pipe(catchError(this.handleError));
  }

  getProjectUserRoles(projectId: string): Observable<string[]> {
    return this.http
      .get<string[]>(environment.API_URL + 'projects/' + projectId + '/role')
      .pipe(catchError(this.handleError));
  }

  getProjectMentors(projectId: string, nextPageKey?: string): Observable<MentorResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }

    return this.http
      .get<MentorResponse>(environment.API_URL + 'projects/' + projectId + '/mentors', { params })
      .pipe(catchError(this.handleError));
  }

  getAllProjectMentors(projectId: string, nextPageKey?: string): Observable<MentorResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    params = params.append('all', 'true');

    return this.http
      .get<MentorResponse>(environment.API_URL + 'projects/' + projectId + '/mentors', { params })
      .pipe(catchError(this.handleError));
  }
  getEditProjectMentors(projectId: string, nextPageKey?: string): Observable<MentorResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    params = params.append('edit', 'true');

    return this.http
      .get<MentorResponse>(environment.API_URL + 'projects/' + projectId + '/mentors', { params })
      .pipe(catchError(this.handleError));
  }
  getProjectPrivateMentees(projectId: string, nextPageKey?: string, command?: string): Observable<Profile[]> {
    let params = new HttpParams();

    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!command) {
      params = params.append('command', command);
    }

    return this.http
      .get<Profile[]>(environment.API_URL + 'projects/' + projectId + '/private-mentees', { params })
      .pipe(catchError(this.handleError));
  }
  getProjectMentees(projectId: string, nextPageKey?: string): Observable<MenteeResponse> {
    let params = new HttpParams();

    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }

    return this.http
      .get<MenteeResponse>(environment.API_URL + 'projects/' + projectId + '/active-mentees', { params })
      .pipe(catchError(this.handleError));
  }

  getAllProjectMentees(projectId: string, limit?: string, nextPageKey?: string): Observable<MenteeResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!limit) {
      params = params.append('limit', limit);
    }

    return this.http
      .get<MenteeResponse>(environment.API_URL + 'projects/' + projectId + '/mentees', { params })
      .pipe(catchError(this.handleError));
  }

  getProjectExpiredApplications(projectId: string): Observable<ExpiredApplication[]> {
    const params = new HttpParams();
    return this.http
      .get<ExpiredApplication[]>(environment.API_URL + 'projects/' + projectId + '/expired-applications', { params })
      .pipe(catchError(this.handleError));
  }

  getProjectOpportunities(projectId: string, limit?: string, nextPageKey?: string): Observable<EmployerResponse> {
    let params = new HttpParams();
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!limit) {
      params = params.append('limit', limit);
    }

    return this.http
      .get<EmployerResponse>(environment.API_URL + 'projects/' + projectId + '/employers', { params })
      .pipe(catchError(this.handleError));
  }

  addMeAsMentor(projectId: string, joinToken: string): Observable<Project[]> {
    let params = new HttpParams();
    params = params.append('token', joinToken);

    return this.http
      .get<Project[]>(environment.API_URL + 'projects/' + projectId + '/member/mentor/status', { params })
      .pipe(catchError(this.handleError));
  }

  declineMyMentorship(projectId: string, joinToken: string): Observable<Project[]> {
    let params = new HttpParams();
    params = params.append('token', joinToken);

    return this.http
      .get<Project[]>(environment.API_URL + 'projects/' + projectId + '/member/mentor/decline', { params })
      .pipe(catchError(this.handleError));
  }

  getProjectCIIStatus(ciiProjectId: string): Observable<any> {
    return this.http.get(BADGE_URL + ciiProjectId).pipe(catchError(this.handleError));
  }

  public getProjectsForList(filter: string, programTermStatus?: string) {
    let params = new HttpParams();
    params = params.append('limit', '1000');
    params = params.append('filter', filter);

    if (!!programTermStatus) {
      params = params.append('programTermStatus', programTermStatus);
    }

    return this.http
      .get<ProjectResponse>(environment.API_URL + 'projects/names/', { params })
      .pipe(map(response => response.projects));
  }

  public getFilteredProjects(filter: string, programTermStatus?: string) {
    let params = new HttpParams();
    params = params.append('limit', '1000');
    params = params.append('filter', filter);

    if (!!programTermStatus) {
      params = params.append('programTermStatus', programTermStatus);
    }

    return this.http
      .get<ProjectResponse>(environment.API_URL + 'projects/', { params })
      .pipe(map(response => response.projects));
  }

  addMeAsApprentice(projectId: string): Observable<Project[]> {
    return this.http
      .post<Project[]>(environment.API_URL + 'projects/' + projectId + '/member/apprentice', {})
      .pipe(catchError(this.handleError));
  }

  updateProjectMemberStatus(
    projectId: string,
    userId: string,
    status: string,
    programTermId: string = '',
    attendanceStatus: string = ''
  ): Observable<any> {
    const body = {
      projectId: projectId,
      userId: userId,
      status: status,
      programTermId: programTermId,
      attendanceStatus,
    };
    return this.http
      .put<any>(environment.API_URL + 'projects/' + projectId + '/member/' + userId + '/status', body)
      .pipe(catchError(this.handleError));
  }

  public getProjectMaintainer(projectId: string) {
    return this.http
      .get<any>(environment.API_URL + 'projects/' + projectId + '/private')
      .pipe(map(response => response));
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

  getAllProjectMenteesByStatus(
    projectId: string,
    status?: string,
    limit?: string,
    nextPageKey?: string
  ): Observable<MenteeResponse> {
    let params = new HttpParams();

    if (status) {
      params = params.append('status', status);
    }

    if (nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (limit) {
      params = params.append('limit', limit);
    }

    return this.http
      .get<MenteeResponse>(environment.API_URL + 'projects/' + projectId + '/public-mentees', { params })
      .pipe(catchError(this.handleError));
  }

  downloadApplications(
    projectID: string,
    status: string,
    applicationStatus: string,
    from: string,
    size: string,
    sortby: string,
    order: string
  ): Observable<MenteeCSVResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.append('status', status);
    }
    if (applicationStatus) {
      params = params.append('applicationStatus', applicationStatus);
    }
    if (from) {
      params = params.append('from', from);
    }
    if (size) {
      params = params.append('size', size);
    }
    if (sortby) {
      params = params.append('sortby', sortby);
    }
    if (order) {
      params = params.append('order', order);
    }
    return this.http
      .get<MenteeCSVResponse[]>(environment.API_URL + 'projects/' + projectID + '/download-applications', { params })
      .pipe(catchError(this.handleError));
  }

  getApplications(projectID: string, request: GetApplicationsRequest = {}): Observable<ProjectApplicationsResponse> {
    const httpOptions = {
      // @info: this can be empty , up to page finished to load
      params: request as any,
    };

    log('### httpOptions', httpOptions);
    const route = `${environment.API_URL}projects/${projectID}/applications`;
    return this.http.get<ProjectApplicationsResponse>(route, httpOptions);
  }

  declinePendingApplications(projectID: string, Applications: any[] = []) {
    const payload = {
      Applications,
    };

    const route = `${environment.API_URL}projects/${projectID}/applications/pending/decline`;
    return this.http.post<boolean>(route, payload);
  }

  public checkTitle(title: string): Observable<boolean> {
    const route = `${environment.API_URL}projects/title-check`;
    const body = {
      title,
    };
    return this.http.post(route, body).pipe(map(response => this.parseCheckTitleResponse(response)));
  }

  private parseCheckTitleResponse(response: any): boolean {
    return response && response.isValid && response.isValid === true;
  }

  mentorshipStatistics() {
    const route = `${environment.API_URL}projects/mentorship-stats`;
    return this.http.get<MentorshipStatistics>(route).pipe(catchError(this.handleError));
  }

  changeProjectStatus(projectId: string, status: string) {
    const url = `${environment.API_URL}projects/${projectId}/status/${status}`;
    return this.http.post(url, {});
  }
}

export interface GetApplicationsRequest {
  type?: string;
  limit?: number;
  status?: string;
  name?: string;
  nextPageKey?: string;
}

export interface ProjectApplicationsResponse {
  NextPageKey: string;
  Data: ProjectApplication[];
}

export interface ProjectApplication {
  MenteeID: string;
  MenteeName: string;
  MenteeAvatar: string;
  ApplicationID: string;
  ApplicationStatus: string;
  ApplicationDateCreate: string;
  ApplicationDateUpdated: string;
  OtherMenteeApplications?: OtherMenteeApplication[];
  ProjectID: string;
  ProgramTermID?: string;
  TasksSubmitted: boolean;
}

export interface OtherMenteeApplication {
  Name: string;
  Status: string;
  ProjectID: string;
}

export interface MentorshipStatistics {
  totalApplicants: number;
  totalAcceptedApplicants: number;
  totalGraduatedApplicants: number;
  TotalStipends: number;
  organizationalSupporters: OrganizationalSupporter[];
  popularPrograms: PopularProgram[];
  popularMentors: PopularMentor[];
}

export interface OrganizationalSupporter {
  totalAmount: number;
  name: string;
  photoURL: string;
}

export interface PopularMentor {
  name: string;
  photoURL: string;
  menteeCount: number;
  taskCount: number;
}

export interface PopularProgram {
  name: string;
  logoURL: string;
  totalApplicants: number;
  totalGraduates: number;
}
