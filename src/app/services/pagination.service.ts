import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DEFAULT_ORDER_BY, DEFAULT_PAGE_SIZE, PROJECT_DEFAULT_SORT_NAME } from '@app/core/constants';
import { Injectable } from '@angular/core';

@Injectable()
export class PaginationService {
  totalFetchedCount = 0;
  constructor(private httpClient: HttpClient) {
    this.totalFetchedCount = 0;
  }

  public getPage(
    endpoint: string,
    extraParams: HttpParams,
    from: number = 0,
    size: number = DEFAULT_PAGE_SIZE,
    sortBy: string = PROJECT_DEFAULT_SORT_NAME,
    orderBy: string = DEFAULT_ORDER_BY
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('from', from.toString());
    params = params.set('size', size.toString());
    params = params.set('sortby', sortBy);
    params = params.set('order', orderBy);

    // Add extra query parameters.
    extraParams.keys().forEach((key: string) => {
      params = params.set(key, extraParams.get(key) as string);
    });

    return this.httpClient.get(endpoint, { params }).pipe(map(response => this.parsePage(response)));
  }

  public getSearchResults(
    endpoint: string,
    match: boolean,
    filter: string,
    status?: string,
    accepting?: boolean
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('match', match ? 'true' : 'false');
    params = params.set('filter', filter);

    if (!match) {
      if (status) {
        params = params.set('status', status);
      }

      if (accepting !== undefined && accepting === false) {
        params = params.set('accepting', 'false');
      } else if (accepting !== undefined && accepting === true) {
        params = params.set('accepting', 'true');
      }
    }

    return this.httpClient.get(endpoint, { params }).pipe(map(response => this.parsePage(response)));
  }

  private parsePage(response: any): any {
    return response.hits;
  }
}
