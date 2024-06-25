// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { removeUndefined } from './transforms';
import { Page } from '../models';

type PageEntryParser<T> = (obj: any) => T;

export class Paginator<T> {
  constructor(private httpClient: HttpClient, private endpoint: string, private parseEntry: PageEntryParser<T>) {}

  getPage(cursor?: string): Observable<Page<T>> {
    let params = new HttpParams();
    if (cursor !== undefined) {
      params = params.set('cursor', cursor);
    }
    return this.httpClient.get(this.endpoint, { params }).pipe(map(response => this.parsePage(response)));
  }

  private parsePage(response: any): Page<T> {
    if (response !== undefined && !response.hasOwnProperty('entries')) {
      const next = undefined;
      const prev = undefined;
      const output = {
        entries: response.map((entry: any) => this.parseEntry(entry)),
        link: {
          nextCursor: next,
          previousCursor: prev
        }
      };
      return output;
    }
    const sourceEntries = response.entries === null ? [] : (response.entries as any[]);
    const entries = sourceEntries.map(entry => this.parseEntry(entry));
    const nextLink = response.link.next !== '' ? response.link.next : undefined;
    const previousLink = response.link.previous !== '' ? response.link.previous : undefined;
    const firstIndex = response.firstIndex;
    return removeUndefined({
      firstIndex,
      entries,
      link: {
        nextCursor: nextLink,
        previousCursor: previousLink
      }
    });
  }
}
