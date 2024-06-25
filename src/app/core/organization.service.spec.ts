// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { API_KEY } from './environment.configuration';
import { ImageUploadService } from './image-upload.service';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  beforeEach(() => {
    const imageUploader = jasmine.createSpyObj('ImageUploadService', ['uploadImage']);
    const baseUrl = 'https://baseurl.com';

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrganizationService,
        { provide: ImageUploadService, useValue: imageUploader },
        { provide: API_KEY, useValue: baseUrl }
      ]
    });
  });

  it('should be created', inject([OrganizationService], (service: OrganizationService) => {
    expect(service).toBeTruthy();
  }));
});
