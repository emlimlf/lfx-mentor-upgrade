// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';
import { Page } from '../models';

describe('Paginator', () => {
  const baseUrl = '/data';

  interface Data {
    a: string;
  }

  @Injectable()
  class DataService {
    private paginator: Paginator<Data>;

    constructor(private httpClient: HttpClient) {
      this.paginator = new Paginator(this.httpClient, baseUrl, obj => obj as Data);
    }

    getPage(cursor?: string) {
      return this.paginator.getPage(cursor);
    }
  }

  let injector: TestBed;
  let httpMock: HttpTestingController;
  let service: DataService;

  function makePageResponse(next?: string, previous?: string) {
    return {
      entries: [{ a: '1' }, { a: '2' }, { a: '3' }, { a: '4' }],
      link: {
        next,
        previous
      }
    };
  }

  function makePage(next?: string, previous?: string): Page<Data> {
    return {
      entries: [{ a: '1' }, { a: '2' }, { a: '3' }, { a: '4' }],
      link: {
        nextCursor: next,
        previousCursor: previous
      }
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    service = injector.get(DataService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPage', () => {
    it('loads a page without a cursor', () => {
      const response = makePageResponse();
      const expected = makePage();

      service.getPage().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(baseUrl);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
    it('loads a page with a cursor', () => {
      const cursor = '12345';
      const nextCursor = '56789';
      const previousCursor = '101112';
      const response = makePageResponse(nextCursor, previousCursor);
      const expected = makePage(nextCursor, previousCursor);

      service.getPage(cursor).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}?cursor=${cursor}`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });
});
