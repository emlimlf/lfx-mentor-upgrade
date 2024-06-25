// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { EmployerService } from '@app/services/employer.service';
import { EmployerResponse } from '@app/models/employer.model';
import { UserService } from '@app/services/user.service';
import { Profile } from '@app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileEditGuard implements CanActivate {
  constructor(private router: Router, private employerService: EmployerService, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const { params, queryParams } = next;

      this.userCanEdit(params, queryParams)
        .then(userCanEdit => {
          if (!userCanEdit) {
            this.redirect();
          }
          resolve(userCanEdit);
        })
        .catch(reject);
    });
  }

  menteeCanEdit(params: any, queryParams: any): Promise<boolean> {
    const isCardClick = this.userService.isClickAction$.value;
    if (isCardClick) {
      const isApprentice = Boolean(localStorage.getItem('isApprentice'));
      return Promise.resolve(isApprentice);
    } else {
      return this.userService
        .loginUser()
        .toPromise()
        .then(({ profiles }) => {
          const userProfiles = profiles as Profile[];
          const isApprentice = userProfiles.some(profile => profile.type === 'apprentice');
          return Promise.resolve(isApprentice);
        });
    }
  }

  employerCanEdit(params: any, queryParams: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const userId = localStorage.getItem('userId');
      const { id: employerId } = queryParams;

      if (userId && employerId) {
        this.employerService.getEmployers('100', undefined, userId).subscribe((response: EmployerResponse) => {
          const { employers } = response;
          const match = employers.find(({ id }) => id === employerId);
          resolve(Boolean(match));
        });
      } else {
        resolve(false);
      }
    });
  }

  mentorCanEdit(params: any, queryParams: any): Promise<boolean> {
    const isCardClick = this.userService.isClickAction$.value;
    if (isCardClick) {
      const isMentor = Boolean(localStorage.getItem('isMentor'));
      return Promise.resolve(isMentor);
    } else {
      return this.userService
        .loginUser()
        .toPromise()
        .then(({ profiles }) => {
          const userProfiles = profiles as Profile[];
          const isMentor = userProfiles && userProfiles.some(profile => profile.type === 'mentor');
          if (!isMentor) {
            window.location.href = '/participate/mentor';
          }
          return Promise.resolve(isMentor);
        });
    }
  }

  userCanEdit(params: any, queryParams: any): Promise<boolean> {
    const { type } = params;
    switch (type) {
      case 'mentor':
        return this.mentorCanEdit(params, queryParams);
      case 'mentee':
        return this.menteeCanEdit(params, queryParams);
      case 'employer':
        return this.employerCanEdit(params, queryParams);
      default:
        return Promise.resolve(false);
    }
  }

  redirect() {
    if (localStorage.getItem('isLoggedIn')) {
      this.router.navigate(['/'], { fragment: 'my-account' });
    } else {
      this.router.navigate(['/']);
    }
  }
}
