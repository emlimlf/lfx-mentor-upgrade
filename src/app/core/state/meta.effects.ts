// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { API_KEY } from '../environment.configuration';
import { LoggerService } from '../logger.service';
import { onStoreInitialized } from '../utilities';

@Injectable()
export class MetaEffects {
  @Effect({ dispatch: false })
  logEndpointMetadataOnInit$ = onStoreInitialized(this.actions$).pipe(
    tap(async () => {
      const result = await getMetadata(this.http, this.api);
      this.loggerService.verbose(`Endpoint Metadata: ${JSON.stringify(result)}`);
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private loggerService: LoggerService,
    @Inject(API_KEY) private api: string
  ) {}
}

async function getMetadata(httpClient: HttpClient, api: string) {
  return await httpClient.get(`${api}/meta`).toPromise();
}
