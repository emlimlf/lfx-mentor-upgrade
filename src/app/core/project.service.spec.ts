// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ENVIRONMENT_KEY, EnvironmentConfiguration } from './environment.configuration';
import { API_KEY } from './environment.configuration';
import { ImageUploadService } from './image-upload.service';
import { AccountType, Diversity, DraftProject, Project, ProjectPage, ProjectStatus } from './models';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  const defaultCreatedOn = new Date();
  const defaultName = 'Dogchain';
  const defaultDescription = 'Blockchain technology for dogs, by dogs.';
  const defaultIndustry = 'blockchain';
  const defaultColor = 'CCCCCC';
  const defaultProjectId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
  const defaultOwnerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
  const baseUrl = 'https://someurl';

  const defaultBudget = { amount: 1000000, allocation: 'Test Allocation' };
  const defaultTermsConditions = true;
  const defaultDiversity = { malePercentage: 30, femalePercentage: 40, unknownPercentage: 30 };
  const defaultDevelopment = { repoLink: 'https://github.com/test', budget: defaultBudget };
  const defaultMarketing = { budget: defaultBudget };
  const defaultMeetups = { budget: defaultBudget };
  const defaultTravel = { budget: defaultBudget };
  const defaultApprentice = {
    budget: defaultBudget,
    mentor: [{ name: 'user', email: 'user@example.com' }],
    termsConditions: defaultTermsConditions
  };

  const draftProject: DraftProject = {
    name: defaultName,
    description: defaultDescription,
    industry: defaultIndustry,
    color: defaultColor,
    diversity: defaultDiversity,
    development: defaultDevelopment,
    marketing: defaultMarketing,
    meetups: defaultMeetups,
    travel: defaultTravel,
    apprentice: defaultApprentice
  };

  const environment: EnvironmentConfiguration = {
    commit: '123abc',
    stage: 'production'
  };

  let injector: TestBed;
  let httpMock: HttpTestingController;
  let service: ProjectService;
  let imageUploader: ImageUploadService;

  function makeResponseModel(name: string, industry: string, description: string, color: string) {
    return {
      status: 'submitted',
      projectId: defaultProjectId,
      ownerId: defaultOwnerId,
      name,
      industry,
      description,
      createdOn: defaultCreatedOn.toISOString(),
      color,
      diversity: defaultDiversity,
      development: defaultDevelopment,
      marketing: defaultMarketing,
      meetups: defaultMeetups,
      travel: defaultTravel,
      apprentice: defaultApprentice,
      projectStats: { backers: 0 },
      badges: [],
      balance: { balanceInCents: 0, availableInCents: 0, debitInCents: 0, creditInCents: 0, expenditures: {} }
    };
  }

  function makeProject(
    name: string,
    industry: string,
    description: string,
    color: string,
    diversity: Diversity
  ): Project {
    return {
      id: defaultProjectId,
      status: ProjectStatus.SUBMITTED,
      ownerId: defaultOwnerId,
      createdOn: defaultCreatedOn,
      name,
      industry,
      description,
      color,
      diversity: defaultDiversity,
      development: defaultDevelopment,
      marketing: defaultMarketing,
      meetups: defaultMeetups,
      travel: defaultTravel,
      apprentice: defaultApprentice,
      projectStats: { backers: 0 },
      logoUrl: '',
      badges: [],
      balance: { availableInCents: 0, balanceInCents: 0, debitInCents: 0, creditInCents: 0, expenditures: {} }
    };
  }
  function makeProjectPageResponse(next?: string, previous?: string) {
    return {
      entries: [
        makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
        makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
        makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
        makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor)
      ],
      link: {
        next,
        previous
      }
    };
  }

  function makeProjectPage(next?: string, previous?: string): ProjectPage {
    return {
      entries: [
        makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
        makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
        makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
        makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity)
      ],
      link: {
        nextCursor: next,
        previousCursor: previous
      }
    };
  }

  function makeOwnProjects(): Project[] {
    return [
      makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
      makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
      makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity),
      makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity)
    ];
  }

  function makeOwnProjectsResponse() {
    return [
      makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
      makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
      makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor),
      makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor)
    ];
  }

  beforeEach(() => {
    imageUploader = jasmine.createSpyObj('ImageUploadService', ['uploadImage']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProjectService,
        { provide: API_KEY, useValue: baseUrl },
        { provide: ENVIRONMENT_KEY, useValue: environment },
        { provide: ImageUploadService, useValue: imageUploader }
      ]
    });
    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
    service = injector.get(ProjectService);
    jasmine.clock().mockDate(defaultCreatedOn);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create', () => {
    it('should return a valid Project', () => {
      const response = makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor);
      const expected = makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity);

      service.create(draftProject).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/projects`);
      expect(testRequest.request.method).toBe('POST');
      testRequest.flush(response);
    });
  });

  describe('get', () => {
    it('should return a valid Project ', () => {
      const response = makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor);
      const expected = makeProject(defaultName, defaultIndustry, defaultDescription, defaultColor, defaultDiversity);

      service.get(defaultProjectId).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/projects/${defaultProjectId}`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });

    it('should return a valid Project and remove empty optional sections', () => {
      let response = makeResponseModel(defaultName, defaultIndustry, defaultDescription, defaultColor);
      response = {
        ...response,
        diversity: { malePercentage: 0, femalePercentage: 0, unknownPercentage: 0 },
        development: { repoLink: '', budget: { amount: 0, allocation: '' } },
        marketing: { budget: { amount: 0, allocation: '' } },
        meetups: { budget: { amount: 0, allocation: '' } },
        travel: { budget: { amount: 0, allocation: '' } },
        apprentice: {
          budget: { amount: 0, allocation: '' },
          mentor: [{ name: 'user', email: 'user@example.com' }],
          termsConditions: defaultTermsConditions
        }
      };
      const { diversity, development, marketing, meetups, travel, apprentice, ...expected } = makeProject(
        defaultName,
        defaultIndustry,
        defaultDescription,
        defaultColor,
        defaultDiversity
      );

      service.get(defaultProjectId).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/projects/${defaultProjectId}`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });

  describe('getByOwner', () => {
    it('should return a list of own Projects ', () => {
      const response = makeOwnProjectsResponse();
      const expected = makeOwnProjects();

      service.getByOwner().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/projects`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });

  describe('getPage', () => {
    it('loads a page without a cursor', () => {
      const response = makeProjectPageResponse();
      const expected = makeProjectPage();

      service.getPage().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/projects/`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
    it('loads a page with a cursor', () => {
      const cursor = '12345';
      const nextCursor = '56789';
      const previousCursor = '101112';
      const response = makeProjectPageResponse(nextCursor, previousCursor);
      const expected = makeProjectPage(nextCursor, previousCursor);

      service.getPage(cursor).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/projects/?cursor=${cursor}`);
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush(response);
    });
  });

  describe('addProjectPaymentAccount', () => {
    it('can add a stripe account', () => {
      const token = '1234';
      const accountId = '12345';
      const response = { type: 'stripe', accountId };
      const expected = { type: AccountType.STRIPE, accountId };

      service.addProjectPaymentAccount(defaultProjectId, token).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const testRequest = httpMock.expectOne(`${baseUrl}/me/projects/${defaultProjectId}/payment-account`);
      expect(testRequest.request.method).toBe('POST');
      testRequest.flush(response);
    });
  });
});
