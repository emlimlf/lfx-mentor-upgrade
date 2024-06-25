// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Auth0DecodedHash } from 'auth0-js';

import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  styleUrls: ['./profile-edit.component.scss'],
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

  type = '';

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.setUp.bind(this));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setUp(authResult: Auth0DecodedHash | null) {
    if (!authResult) {
      return;
    }

    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params: Params) => {
      this.type = params.type;
    });
  }
}
