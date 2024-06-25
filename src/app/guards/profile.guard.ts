// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@app/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const { params } = next;
    const { id } = params;
    return new Promise((resolve, reject) => {
      // Verify if the profile is valid.
      this.userService.getProfileByType(id, state.url.includes('mentor') ? 'mentor' : 'apprentice').subscribe(
        ({ id }) => {
          if (!id) {
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

  redirect() {
    this.router.navigate(['/404']);
  }
}
