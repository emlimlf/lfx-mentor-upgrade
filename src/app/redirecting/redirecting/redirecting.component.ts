// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirecting',
  templateUrl: './redirecting.component.html',
  styleUrls: ['./redirecting.component.scss']
})
export class RedirectingComponent implements OnInit {
  constructor(private router: Router) {
  }

  ngOnInit() {
    setTimeout(() => {
      const { pathname } = window.location;

      if (pathname === '/auth') {
        if(localStorage.getItem('loginRedirectURI')){
          this.router.navigate([localStorage.getItem('loginRedirectURI')]);
          localStorage.removeItem('loginRedirectURI');
        } else {
          this.router.navigate(['']);
        }
      }
    }, 500);
  }
}
