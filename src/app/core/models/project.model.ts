// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ExpenseCategory } from './transaction.model';

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  DECLINED = 'declined',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

export enum BadgeType {
  SECURITY = 'security',
  APPRENTICE = 'apprentice',
  CII_GOLD = 'cii-gold',
  CII_SILVER = 'cii-silver',
  CII_PASSING = 'cii-passing',
}

export interface ProjectSubscription {
  projectId: string;
  createdOn: Date;
  amountInCents: number;
  industry: string;
  name: string;
  color: string;
  description: string;
  orgId?: string;
  logoUrl: string;
  category?: ExpenseCategory;
}

export interface ProjectBudget {
  development?: Development;
  marketing?: Marketing;
  meetups?: Meetups;
  travel?: Travel;
  apprentice?: Apprentice;
  other?: Other;
}

export interface DraftProject extends ProjectBudget {
  name: string;
  industry: string;
  description: string;
  color: string;
  logo?: File | string;

  diversity?: Diversity;
  contributors?: Contributor[];
  codeOfConduct?: CodeOfConduct;
}

export interface Contributor {
  name: string;
  email: string;
}

export interface Mentor {
  name: string;
  email: string;
}

export interface Person {
  name: string;
  email: string;
  value: string;
}

export interface Skill {
  name: string;
}

export interface Project extends DraftProject {
  id: string;
  ownerId: string;
  status: ProjectStatus;
  createdOn: Date;
  logoUrl?: string;
  githubStats?: GithubStats;
  projectStats: ProjectStats;
  badges?: Badge[];
  balance?: Balance;
  vulnerabilities?: Vulnerabilities;
}

export interface Badge {
  type: BadgeType;
}

export interface GithubStats {
  openIssues: number;
  stars: number;
  forks: number;
}

export interface ProjectStats {
  backers: number;
}

// Vulnerabilities represents a summary of a project's vulnerability report
export interface Vulnerabilities {
  highCount: number;
  mediumCount: number;
  lowCount: number;
  lastUpdated: Date;
}

export interface ExpenditureSummary {
  balanceInCents: number;
  debitInCents: number;
  creditInCents: number;
  transactionCount: number;
}

export interface Balance {
  balanceInCents: number;
  availableInCents: number;
  debitInCents: number;
  creditInCents: number;
  expenditures: { [key in ExpenseCategory]?: ExpenditureSummary };
}

// Budget holds a monetary amount as well as a description of the funds' allocation
export interface Budget {
  amount: number;
  allocation: string;
}

export interface Diversity {
  malePercentage: number;
  femalePercentage: number;
  unknownPercentage: number;
}

// Development holds development information and the development budget for a project
export interface Development {
  repoLink: string;
  budget: Budget;
}

// Marketing holds the marketing budget for a project
export interface Marketing {
  budget: Budget;
}

// Meetups holds the meetups budget for a project
export interface Meetups {
  budget: Budget;
}

// Travel holds the travel budget for a project
export interface Travel {
  budget: Budget;
}

// Apprentice holds the apprentice budget for a project
export interface Apprentice {
  budget: Budget;
  mentor: Mentor[];
  termsConditions: boolean;
}

// Other holds the miscellaneous budget for a project
export interface Other {
  budget: Budget;
}

export interface CodeOfConduct {
  link: string;
}
