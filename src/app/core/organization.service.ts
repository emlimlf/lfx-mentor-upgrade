// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import * as uuidv4 from 'uuid/v4';
import { API_KEY } from './environment.configuration';
import { FileUploadService } from './file-upload.service';
import { Organization } from './models';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(API_KEY) private apiUrl: string,
    private httpClient: HttpClient,
    private fileUploader: FileUploadService
  ) {}

  getUserOrganizations(): Observable<Organization[]> {
    const url = `${this.apiUrl}/me/organizations/`;
    return this.httpClient.get(url) as Observable<Organization[]>;
  }

  createOrganization(name: string, file: File): Observable<Organization> {
    return this.fileUploader.uploadFile(file).pipe(mergeMap(url => this.createOrganizationWithAvatar(name, url)));
  }

  updateOrganization(oldOrganization: Organization, name: string, file?: File): Observable<Organization> {
    const newOrg: Organization = {
      name,
      avatarUrl: oldOrganization.name,
      id: oldOrganization.id,
    };

    if (file === undefined) {
      return this.updateOrganizationWithAvatar(newOrg);
    }
    return this.fileUploader.uploadFile(file).pipe(mergeMap(url => this.updateOrganizationWithAvatar(newOrg, url)));
  }

  private createOrganizationWithAvatar(name: string, avatarUrl: string): Observable<Organization> {
    const url = `${this.apiUrl}/me/organizations/`;
    const org = { name, avatarUrl };

    return this.httpClient.post(url, org) as Observable<Organization>;
  }

  private updateOrganizationWithAvatar(organization: Organization, avatarUrl?: string): Observable<Organization> {
    const url = `${this.apiUrl}/me/organizations/${organization.id}`;
    const org = { name: organization.name, avatarUrl: organization.avatarUrl };
    if (avatarUrl !== undefined) {
      org.avatarUrl = avatarUrl;
    }

    return this.httpClient.put(url, org) as Observable<Organization>;
  }
}
