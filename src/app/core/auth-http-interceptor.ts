// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.checkExceptionURLs(request)) {
      return next.handle(request);
    } else {
      return this.auth.getIdToken$().pipe(
        mergeMap(token => {
          if (!token) {
            return next.handle(request.clone());
          }

          const tokenReq = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
          return next.handle(tokenReq);
        }),
        catchError(err => throwError(err))
      );
    }
  }

  checkExceptionURLs(request: HttpRequest<any>) {
    return request.url.includes('s3.amazonaws.com');
  }
}
