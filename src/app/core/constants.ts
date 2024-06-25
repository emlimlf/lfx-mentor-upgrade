// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export const AUTH_ROUTE = 'auth';
export const PROJECT_CREATE_ROUTE = 'projects/create';
export const STRIPE_REDIRECT_ROUTE = 'stripe';
export const GITHUB_REDIRECT_ROUTE = 'github';
export const EMAIL_APPROVE_REDIRECT_ROUTE = 'email/approve-project';
export const PROJECT_ROUTE = 'projects';
export const LANDING_ROUTE = '';
export const ACCOUNT_ROUTE = 'account';
export const APPLY_ROUTE = 'apply';
export const DONATE_ROUTE = 'donate';
export const ERROR_ROUTE = '';
export const DISCOVER_ROUTE = 'discover';
export const PROFILE_ROUTE = 'profile';

export const SUBMIT_CLOSE_DELAY_MS = 1200;

export enum CommonColor {
  NOT_FOUND = 'f3f4f4',
}

export enum BudgetColor {
  DEVELOPMENT = '25b55b',
  MARKETING = '0e6dd4',
  MEETUPS = '95dbe4',
  TRAVEL = 'e94927',
  APPRENTICE = 'ffc100',
  OTHER = '103b64',
}

export enum CommunityColor {
  MALE = 'a594db',
  FEMALE = '6448c1',
  UNKNOWN = '3c297a',
}

export const MAX_TASK_NAME_LENGTH = 20;
export const MAX_TASK_DESCRIPTION_LENGTH = 500;
export const CODE_OF_CONDUCT = 'https://www.contributor-covenant.org/version/1/4/code-of-conduct';

export const PHONE_NUMBER_PATTERN = '^[0-9-+s()]*$';
export const MIN_PHONE_NUMBER_LENGTH = 4;
export const MAX_PHONE_NUMBER_LENGTH = 12;
export const TASK_FILE_EXTENSIONS = ['doc', 'docx', 'pdf'];

export const TIME_FORMAT_24_HOURS = { hour: '2-digit', minute: '2-digit', hour12: false };

export const MENTEE_INTRODUCTION_PLACEHOLDER = `Answer the following questions:

1. What is your current status, are you a student/transitioning into a new career?
2. What are your goals and aspirations? 
3. Why are you interested in this mentorship opportunity?
4. Tell us something that makes you unique as an applicant.
`;

export const MENTOR_INTRODUCTION_PLACEHOLDER = `Answer the following questions:

1. What is your current contributor status (i.e., experience in contributing/maintaining open source projects, open source contributions)?
2. Why are you interested in volunteering as a mentor?
3. Tell us something that makes you unique.

Note: This information will be displayed on your mentor profile page.`;

export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1500;

export const DEFAULT_PAGE_SIZE = 25;
export const PROJECT_DEFAULT_SORT_NAME = 'name';
export const PROJECT_DEFAULT_SORT_UPDATED_STAMP = 'updatedStamp';
export const DEFAULT_ORDER_BY = 'desc';
export const MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD = 'slug.keyword';
export const ORDER_BY_ASCENDING = 'asc';
