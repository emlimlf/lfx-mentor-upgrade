// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { API_KEY } from './environment.configuration';
import { ENVIRONMENT_KEY, EnvironmentConfiguration } from './environment.configuration';
import { FileUploadService } from './file-upload.service';
import {
  AccountType,
  Balance,
  Budget,
  DraftProject,
  GithubStats,
  PaymentAccount,
  Project,
  ProjectPage,
  ProjectStatus,
  Vulnerabilities,
} from './models';
import { RouterStateUrl } from './router';
import { guid, removeUndefined } from './utilities';
import { Paginator } from './utilities/paginator';

const projectStatusLookup: { [key: string]: ProjectStatus } = {
  draft: ProjectStatus.DRAFT,
  submitted: ProjectStatus.SUBMITTED,
  declined: ProjectStatus.DECLINED,
  approved: ProjectStatus.APPROVED,
  published: ProjectStatus.PUBLISHED,
  hidden: ProjectStatus.HIDDEN,
};

const accountTypeLookup: { [key: string]: AccountType } = {
  stripe: AccountType.STRIPE,
};

export interface ApproveProjectResult {
  project: Project;
}

@Injectable()
export class ProjectService {
  private paginator: Paginator<Project>;

  constructor(
    private httpClient: HttpClient,
    private fileUpload: FileUploadService,
    @Inject(API_KEY) private api: string,
    @Inject(ENVIRONMENT_KEY) private environment: EnvironmentConfiguration
  ) {
    const route = `${this.api}/projects/`;
    this.paginator = new Paginator(this.httpClient, route, obj => this.parseProject(obj));
  }

  public create(draft: DraftProject): Observable<Project> {
    const route = `${this.api}/me/projects`;
    const uploadLogoIfNeeded$ =
      typeof draft.logo === 'string' || draft.logo === undefined
        ? of(draft)
        : this.fileUpload.uploadFile(draft.logo).pipe(map((logoUrl: string) => ({ ...draft, logoUrl })));
    return uploadLogoIfNeeded$.pipe(
      flatMap((draftWithLogoPath: DraftProject) => this.httpClient.post(route, draftWithLogoPath)),
      map(response => this.parseProject(response))
    );
  }

  public get(id: string): Observable<Project> {
    const route = `${this.api}/projects/${id}`;
    return this.httpClient.get(route).pipe(map(response => this.parseProject(response)));
  }

  public getByOwner() {
    const route = `${this.api}/me/projects`;
    let response = this.httpClient.get(route) as Observable<Array<any>>;
    response = response.pipe(map(res => res.map(obj => this.parseProject(obj))));
    return response;
  }

  public getPage(cursor?: string): Observable<ProjectPage> {
    return this.paginator.getPage(cursor);
  }

  public addProjectPaymentAccount(projectId: string, stripeCode: string) {
    const route = `${this.api}/me/projects/${projectId}/payment-account`;
    const body = {
      type: 'stripe',
      code: stripeCode,
    };
    return this.httpClient.post(route, body).pipe(map(response => this.parseAccount(response)));
  }

  public postJWTFromBrowserURL(routerState: RouterStateUrl): Observable<ApproveProjectResult> {
    const jwt = routerState.queryParamMap.get('jwt');
    if (jwt === null) {
      return throwError(new Error("JWT doesn't exist in route"));
    }

    const route = `${this.api}/projects/approvals`;

    return this.httpClient.post(route, jwt).pipe(
      map(result => {
        return { project: result as Project };
      })
    );
  }

  private parseProject(response: any): Project {
    const createdOn = new Date(response.createdOn);
    const status = projectStatusLookup[response.status];

    // Can be removed once backend handles optional form sections
    const diversity =
      response.diversity !== undefined &&
      response.diversity.malePercentage === 0 &&
      response.diversity.femalePercentage === 0 &&
      response.diversity.unknownPercentage === 0
        ? undefined
        : response.diversity;
    const development =
      response.development !== undefined &&
      this.checkEmptyBudget(response.development.budget) &&
      response.development.repoLink === ''
        ? undefined
        : response.development;
    const marketing =
      response.marketing !== undefined && this.checkEmptyBudget(response.marketing.budget)
        ? undefined
        : response.marketing;
    const meetups =
      response.meetups !== undefined && this.checkEmptyBudget(response.meetups.budget) ? undefined : response.meetups;
    const travel =
      response.travel !== undefined && this.checkEmptyBudget(response.travel.budget) ? undefined : response.travel;
    const apprentice =
      response.apprentice !== undefined && this.checkEmptyBudget(response.apprentice.budget)
        ? undefined
        : response.apprentice;
    const other =
      response.other !== undefined && this.checkEmptyBudget(response.other.budget) ? undefined : response.other;

    const githubStats =
      response.githubStats !== undefined && this.checkEmptyStats(response.githubStats)
        ? undefined
        : response.githubStats;
    const logoUrl = response.logoUrl !== undefined ? response.logoUrl : '';
    const badges = response.badges !== undefined ? response.badges : [];
    const emptyBalance: Balance = {
      availableInCents: 0,
      balanceInCents: 0,
      debitInCents: 0,
      creditInCents: 0,
      expenditures: {},
    };

    const balance = response.balance !== undefined ? response.balance : emptyBalance;

    const emptyProjectStats = { backers: 0 };
    const projectStats = response.projectStats !== undefined ? response.projectStats : emptyProjectStats;

    let vulnerabilities;
    if (response.vulnerability !== undefined) {
      const lastUpdated = new Date(response.vulnerability.lastUpdated);
      vulnerabilities = {
        ...response.vulnerability,
        lastUpdated,
      };
    }
    const codeOfConduct = response.codeOfConduct;

    const projectCIIProjectId = response.projectCIIProjectId ? response.projectCIIProjectId : undefined;

    return removeUndefined({
      id: response.projectId,
      ownerId: response.ownerId,
      name: response.name,
      industry: response.industry,
      description: response.description,
      createdOn,
      color: response.color,
      status,
      diversity,
      development,
      marketing,
      meetups,
      travel,
      apprentice,
      other,
      githubStats,
      projectStats,
      logoUrl,
      badges,
      balance,
      vulnerabilities,
      codeOfConduct,
      projectCIIProjectId,
    });
  }

  private checkEmptyBudget(budget: Budget) {
    return budget.amount === 0 && budget.allocation === '';
  }

  private checkEmptyStats(stats: GithubStats) {
    return stats.forks === 0 && stats.stars === 0 && stats.openIssues === 0;
  }

  private parseAccount(response: any): PaymentAccount {
    const type = accountTypeLookup[response.type];
    return {
      type,
      accountId: response.accountId,
    };
  }
}
