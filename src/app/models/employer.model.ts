// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export interface Employer {
  id: string;
  lfid: string;
  companyName: string;
  logoUrl: string;
  description: string;
  interviewOpportunities: InterviewOpportunities;
  status: string;
  termsAndConditions?: boolean;
  invitations?: Invitations;
}

export interface EmployerCard {
  topHeaderStyle: { [styleProp: string]: string };
  logoUrl: string;
  title: string;
  description: string;
  participationStatus?: ParticipationStatus;
  totalFunding: string;
  opportunities: number;
  participation: HiringOpportunitiesProjectDetails[];
  subcardShown?: 'participation' | 'description' | null;
  status?: string;
}

export interface EmployerResponse {
  employers: Employer[];
  nextPageKey: string;
}
export interface ParticipationStatus {
  participatingHiring: boolean;
  participatingFunding: boolean;
}

export interface InterviewOpportunities {
  participatingHiring: boolean;
  hiringOpportunities?: HiringOpportunities;
  participatingFunding: boolean;
  fundingOpportunities?: FundingOpportunities;
}

export interface HiringOpportunitiesProjectDetails {
  projectId: string;
  name: string;
  logoUrl: string;
  lfid: string;
}

export interface HiringOpportunities {
  interviews: number;
  contact: Contact;
  skills: string[];
  projects: string[];
  HiringOpportunitiesProjectDetails?: HiringOpportunitiesProjectDetails[];
}

export interface FundingOpportunities {
  amount: number;
  contact: Contact;
  projects: string[];
  initiatives: string[];
}

export interface Invitations {
  mentors: Invite[];
  maintainers?: Invite[];
}

export interface Invite {
  name: string;
  email: string;
}

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Job {
  id: string;
  name: string;
  jobDetails: JobDetails;
}

export interface JobDetails {
  description: string;
  url: string;
  desiredSkills: string[];
}
