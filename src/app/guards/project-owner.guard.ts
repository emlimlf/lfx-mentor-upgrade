// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectOwnerGuard implements CanActivate {
  constructor(private projectService: ProjectService, private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const projectID = route.params['id'];
    return new Promise((resolve, reject) => {
      return this.authService
        .getUser$()
        .toPromise()
        .then(userProfile => {
          if (!userProfile) {
            this.redirect();
            return;
          }
          const currentLFID = userProfile['https://sso.linuxfoundation.org/claims/username'];
          if (currentLFID) {
            this.projectService
              .getProject(projectID)
              .toPromise()
              .then(({ lfid }) => {
                if (currentLFID === lfid) {
                  resolve(true);
                } else {
                  this.redirect();
                  resolve(false);
                }
              })
              .catch(reject);
          } else {
            this.redirect();
          }
        });
    });
  }
  redirect() {
    if (localStorage.getItem('isLoggedIn')) {
      this.router.navigate(['/'], { fragment: 'my-account' });
    } else {
      this.router.navigate(['/']);
    }
  }
}
