// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';
import { Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MenteeAdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let { id: menteeId } = next.pathFromRoot[2].params;

    menteeId = (menteeId as string).split(',')[0];

    return this.authService.isAuthenticated$.pipe(
      switchMap(loggedIn => {
        const isUserAdmin$ = loggedIn ? this.userService.canUserViewMenteeTasks(menteeId) : of(false);

        return isUserAdmin$.pipe(
          tap(canActivate => {
            if (!canActivate) {
              this.redirect(menteeId);
            }
          })
        );
      }),
      catchError(_ => of(false))
    );
  }

  private redirect(menteeId: string) {
    this.router.navigate([`/mentee/${menteeId}`]);
  }
}
