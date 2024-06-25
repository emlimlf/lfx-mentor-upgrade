// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface PresignedPutResponse {
  uploadUrl: string;
  destinationUrl: string;
  contentType: string;
}

@Injectable()
export class FileUploadService {
  constructor(private httpClient: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    //console.log('uploadFile', file);
    if (!file) {
      return of('');
    }

    return this.getPresignedUrl(file).pipe(
      flatMap(url => {
        //console.log('presignedUrl', url);
        return this.uploadToPresignedUrl(url.uploadUrl, url.contentType, file).pipe(map(_ => url.destinationUrl));
      })
    );
  }

  private getPresignedUrl(file: File): Observable<PresignedPutResponse> {
    const route = environment.API_URL + 'upload/presigned-url';
    let fileName = '';
    if (file.name) {
      fileName = file.name.replace(/(.*)(?=\.\w*$)/gi, '').toLowerCase();
    } else {
      fileName = file
        .toString()
        .replace(/(.*)(?=\.\w*$)/gi, '')
        .toLowerCase();
    }
    const body = {
      contentType: file.type,
      name: fileName,
      size: file.size,
    };
    console.log('getPresignedUrl', route, file, body);
    return this.httpClient.post<PresignedPutResponse>(route, body) as Observable<PresignedPutResponse>;
  }

  private uploadToPresignedUrl(url: string, contentType: string, file: File): Observable<Object> {
    const headers = new HttpHeaders({
      'x-amz-acl': 'public-read',
      'content-type': contentType,
    });
    //console.log('uploadToPresignedUrl', url, file);
    return this.httpClient.put(url, file, { headers });
  }
}
