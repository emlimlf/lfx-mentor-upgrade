// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { MentorResponse, Profile, Relationship, User, UserRoles, ProfileProject } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public isClickAction$ = new BehaviorSubject<Boolean>(false);
  constructor(private http: HttpClient, private authService: AuthService, private projectService: ProjectService) {}

  createUser(): Observable<any> {
    return this.http.post(environment.API_URL + 'users', {}).pipe(catchError(this.handleError));
  }

  loginUser(): Observable<any> {
    return this.http.post(environment.API_URL + 'users/login', {}).pipe(catchError(this.handleError));
  }

  getProfileByType(userId: string, profileType: string): Observable<Profile> {
    if (profileType === 'mentor') {
      return this.http
        .get<Profile>(environment.API_URL + 'mentors/' + userId + '/profile/' + profileType)
        .pipe(catchError(err => of(err)));
    } else {
      return this.http
        .get<Profile>(environment.API_URL + 'users/' + userId + '/profile/' + profileType)
        .pipe(catchError(err => of(err)));
    }
  }

  getUserRelationships(userId: string, isMentee = false): Observable<Relationship[]> {
    return this.authService.isAuthenticated$.pipe(
      switchMap(loggedIn => {
        if (!loggedIn) {
          return throwError(new HttpErrorResponse({ error: new Error('Not authenticated.') }));
        }

        const sources = [this.http.get<Relationship[]>(environment.API_URL + 'users/' + userId + '/relationships')];

        // if (isMentee) {
        //   sources.push(this.getUserMaintainerRelationships(userId).pipe(map(({ relationships }) => relationships)));
        // }

        return forkJoin(sources).pipe(
          map(result => result.reduce((all, relationships) => [...all, ...relationships], [] as Relationship[]))
        );
      }),
      catchError(this.handleError)
    );
  }

  getPrivateProfileByType(userId: string, profileType: string): Observable<Profile> {
    return this.http
      .get<Profile>(environment.API_URL + 'users/' + userId + '/profile/' + profileType + '/private')
      .pipe(catchError(this.handleError));
  }
  getPrvProfileByType(userId: string, profileType: string): Observable<Profile> {
    return this.http
      .get<Profile>(environment.API_URL + 'users/' + userId + '/profile/' + profileType + '/privateProfile')
      .pipe(catchError(this.handleError));
  }
  createUserProfile(profile: Profile): Observable<any> {
    return this.http.put<User>(environment.API_URL + 'users', profile).pipe(catchError(this.handleError));
  }

  updateUserProfile(profile: Profile, profileType: string): Observable<any> {
    return this.http
      .put<User>(environment.API_URL + 'users/profile/' + profileType, profile)
      .pipe(catchError(this.handleError));
  }
  getMentor(limit?: string, nextPageKey?: string, filter?: string, id?: string): Observable<MentorResponse> {
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
    if (!!id) {
      params = params.append('id', id);
    }
    // const route = environment.API_URL + 'users/mentors';
    const route = environment.API_URL + 'mentors';
    return this.http
      .get<MentorResponse>(route, { params })
      .pipe(catchError(this.handleError));
  }
  getMentors(limit?: string, nextPageKey?: string, hasProjects?: boolean, filter?: string): Observable<MentorResponse> {
    let params = new HttpParams();
    if (!!limit) {
      params = params.append('limit', limit);
    }
    if (!!nextPageKey) {
      params = params.append('nextPageKey', nextPageKey);
    }
    if (!!hasProjects) {
      params = params.append('hasProjects', hasProjects ? 'true' : 'false');
    }

    if (!!filter) {
      params = params.append('filter', filter);
    }

    // const route = environment.API_URL + 'users/mentors';
    const route = environment.API_URL + 'mentors';
    return this.http
      .get<MentorResponse>(route, { params })
      .pipe(catchError(this.handleError));
  }

  getFeaturedUsers(profileType?: string): Observable<any> {
    return this.http.get<any>(environment.API_URL + `users/featured/${profileType}`).pipe(catchError(this.handleError));
  }

  getMentorProjects(userId: string): Observable<ProfileProject[]> {
    // /users/{userID}/profile/mentor/projects
    return this.http
      .get<ProfileProject[]>(environment.API_URL + `users/${userId}/profile/mentor/projects`)
      .pipe(catchError(this.handleError));
  }

  canUserViewMenteeTasks(menteeId: string): Observable<boolean> {
    if (menteeId === localStorage.getItem('userId')) {
      return of(true);
    }

    return this.getUserRelationships(menteeId, true).pipe(
      map(relationships => relationships.some(({ myRole }) => myRole === 'mentor' || myRole === 'maintainer')),
      catchError(_ => of(false))
    );
  }

  getUserMaintainerRelationships(
    menteeId: string,
    limit?: string,
    nextPageKey?: string
  ): Observable<{ relationships: Relationship[]; nextPageKey: string }> {
    return this.authService.isAuthenticated$.pipe(
      map(loggedIn => loggedIn && localStorage.getItem('userId')),
      switchMap(userId => {
        if (!userId) {
          return throwError(new HttpErrorResponse({ error: new Error('Unauthorized user.') }));
        }

        return this.projectService.getProjects('maintainer', limit, nextPageKey).pipe(
          switchMap(({ projects, nextPageKey: nextPageProjectsKey }) => {
            if (projects.length) {
              return forkJoin(
                projects.map(({ projectId }) =>
                  this.projectService.getProjectMembers(projectId).pipe(
                    map(members =>
                      members.filter((member: any) => member.memberType === 'apprentice' && member.userId === menteeId)
                    ),
                    map(members => ({ projectId, members }))
                  )
                )
              ).pipe(
                map(result => ({
                  relationships: result
                    .filter(({ members }) => members.length > 0)
                    .map(({ projectId }) => ({
                      myRole: 'maintainer',
                      theirRole: 'mentee',
                      projectId,
                    })),
                  nextPageKey: nextPageProjectsKey,
                }))
              );
            }

            return of({ relationships: [], nextPageKey: nextPageProjectsKey });
          })
        );
      }),
      catchError(_ => of({ relationships: [], nextPageKey: '' }))
    );
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
    // return an observable with a user-facing error message
    return throwError(error.status + '|Something bad happened; please try again later.');
  }

  isMentor(role: string): boolean {
    return !!role && role.toLowerCase() === UserRoles.Mentor;
  }

  isMaintainer(role: string): boolean {
    return !!role && role.toLowerCase() === UserRoles.Maintainer;
  }

  isMentee(role: string): boolean {
    return !!role && (role.toLowerCase() === UserRoles.Mentee || role.toLowerCase() === UserRoles.Apprentice);
  }
}
