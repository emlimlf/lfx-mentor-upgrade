// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ProjectService } from '@app/services/project.service';

@Injectable({
  providedIn: 'root',
})
export class HiddenStatusGuard implements CanActivate {
  constructor(private router: Router, private projectService: ProjectService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const { params, queryParams } = next;
    const { id } = params;
    const isCardClick = ProjectService.isClickAction$.value;
    if (isCardClick) {
      return Promise.resolve(true);
    } else {
      return new Promise((resolve, reject) => {
        this.projectService.getProject(id).subscribe(
          ({ status }) => {
            if (
              Number(status) === 400 ||
              Number(status) === 404 ||
              Number(status) === 500 ||
              status.toLowerCase() === 'hide' ||
              status.toLowerCase() === 'hidden'
            ) {
              this.redirect();
              resolve(false);
            }
            resolve(true);
          },
          _ => {
            resolve(false);
          }
        );
      });
    }
  }

  redirect() {
    this.router.navigate(['/404']);
  }
}
