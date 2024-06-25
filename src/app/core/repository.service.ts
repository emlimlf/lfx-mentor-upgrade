// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_KEY } from './environment.configuration';
import { Paginator } from './utilities/paginator';
import { RepoPage, Repository } from './models/index';

@Injectable()
export class RepositoryService {
  private paginator: Paginator<Repository>;

  constructor(private httpClient: HttpClient, @Inject(API_KEY) private api: string) {
    const route = `${this.api}/me/repositories`;
    this.paginator = new Paginator(this.httpClient, route, obj => {
      return parseRepo(obj);
    });
  }

  public getPage(cursor?: string): Observable<RepoPage> {
    return this.paginator.getPage(cursor);
  }

  public get() {
    const route = `${this.api}/me/repositories`;
    return this.httpClient.get(route);
  }
}

export function parseRepo(response: any): Repository {
  return {
    ownerName: response.ownerName,
    ownerAvatarURL: response.ownerAvatarURL,
    repoName: response.repoName
  };
}
