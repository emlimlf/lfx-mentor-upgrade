// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { MenteeUser } from '@app/models/user.model';
import { TaskView } from '@app/shared/tasks/tasks/tasks.component';

export interface Project {
  projectId: string;
  name: string;
  status: string;
  industry: string;
  description: string;
  projectCIIProjectId: string;
  ciiMarkup?: string;
  color: string;
  repoLink: string;
  websiteUrl: string;
  apprenticeNeeds: ApprenticeNeeds;
  programTerms: ProgramTerm[];
  programTermsClosed?: ProgramTerm[];
  logoUrl: string;
  codeOfConduct: string;
  tasks: Task[];
  opportunities?: Opportunity[];
  lfid?: string;
  taskTemplates?: Task[];
  termsAndConditions?: boolean;
  acceptApplications?: boolean;
  createdOn?: string;
  slug?: string;
  fundspringProjectId?: string;
  menteeStatus?: string;
  amountRaised?: number;
  programTermStatus?: string;
  mentors?: Mentor[];
}
export interface ProjectTasksSection {
  allTasks: TaskView[];
  projectId: string;
  projectColor: string;
  projectName: string;
  projectLogoUrl?: string;
  createdOn?: string;
}
export interface ProjectWithTasks {
  projectColor: string;
  projectId: string;
  projectName: string;
  projectTerms: ProgramTerm[];
  projectTasks: TaskView[];
  projectLogoUrl?: string;
  projectMenteeStatus?: string;
  createdOn?: string;
  apprenticeName?: string;
  menteeStatus?: string;
}
export interface ProjectResponse {
  projects: Project[];
  nextPageKey: string;
  acceptanceStatusList?: ProjectApplication[];
}

export interface MentorResponse {
  mentors: Mentor[];
  nextPageKey: string;
}

export interface MenteeResponse {
  mentees: Mentee[];
  nextPageKey: string;
}

export interface MenteeCSVResponse {
  projectId: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationStatus: string;
  termStatus: string;
  applicationDateCreate: string;
  applicationDateUpdate: string;
}

export interface MentorMenteesResponse {
  users: MenteeUser[];
  nextPageKey: string;
}

export interface Opportunity {
  name: string;
  logoUrl: string;
}

export interface ProjectJob {
  projectId: string;
  jobId: string;
  employerId: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
}

export interface ApprenticeNeeds {
  skills: string[];
  mentors: Mentor[];
  acceptedMentees?: any;
  graduatedMentees?: any;
}

export interface LocalProgramTerm {
  id?: string;
  name: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  Active?: string;
}

export interface ProgramTerm {
  id?: string;
  name: string;
  startDateTime: number;
  endDateTime: number;
  activeUsers?: number;
  Active?: string;
}

export interface Task {
  id?: string;
  projectId?: string;
  assigneeId?: string;
  ownerId?: string;
  name: string;
  description: string;
  status?: string;
  createdOn?: string;
  updatedOn?: string;
  dueDate?: string;
  createdBy?: string;
  progressPercentage?: number;
  estimatedTime?: string;
  completionDate?: string;
  priority?: string;
  category?: string;
  custom?: string;
  file?: string;
  submitFile?: string;
}

export interface TaskResponse {
  tasks: Task[];
  nextPageKey: string;
}

export interface Mentor {
  name: string;
  email: string;
  avatarUrl?: any;
  introduction?: string;
}

export interface Mentee {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  introduction?: string;
  status?: string;
}

export interface ProjectMentor {
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  description?: string;
}

export interface ProjectMentee {
  name: string;
  avatarUrl?: string;
  description?: string;
}

export interface ProjectCard {
  projectId: string;
  topHeaderStyle: any;
  logoUrl: string;
  tags: string[];
  title: string;
  description: string;
  status?: string;
  terms: ProgramTerm[];
  opportunities: Opportunity[];
  subcardShown: 'mentors' | 'funding' | 'description' | 'opportunities' | null;
  mentors: ProjectMentor[];
  acceptApplications?: boolean;
  fundspringProjectId?: string;
  slug?: string;
  acceptanceStatus?: string;
  menteeStatus?: string;
  programTermStatus?: string;
  amountRaised: number;
  projectCIIProjectId?: string;
  ciiMarkup?: string;
  apprenticeNeeds?: ApprenticeNeeds;
}

export interface ProjectFundingStatusCategory {
  totalDonationsInCents: number;
  totalSubscriptionCount: number;
  totalAnnualGoalInCents: number;
  annualSubscriptionAmountInCents: number;
  annualSubscriptionRemainingAmountInCents: number;
}

export interface ProjectFundingStatus {
  totalDonationsInCents: number;
  totalSubscriptionCount: number;
  totalAnnualGoalInCents: number;
  annualSubscriptionAmountInCents: number;
  annualSubscriptionRemainingAmountInCents: number;

  mentee: ProjectFundingStatusCategory;
  other: ProjectFundingStatusCategory;
  development: ProjectFundingStatusCategory;
  marketing: ProjectFundingStatusCategory;
  travel: ProjectFundingStatusCategory;
  meetups: ProjectFundingStatusCategory;
}

export interface ProjectApplication {
  description?: string;
  id?: string;
  logoUrl?: string;
  memberType?: string;
  name?: string;
  projectId: string;
  status: string;
  userId: string;
  updatedAt: string;
}

export interface ExpiredApplication {
  id: string;
  programTermId: string;
  projectId: string;
  userId: string;
  status: string;
  createdOn: string;
  updatedOn: string;
  startDateTime: number;
  endDateTime: number;
  programTermStatus: string;
  menteeFirstName: string;
  menteeLastName: string;
  programTermName: string;
  menteeAvatar?: string;

  createdOnDate?: string;
  createdOnTime?: string;
  updatedOnDate?: string;
  updatedOnTime?: string;
  name?: string;
}

export enum ProjectMemberStatus {
  Pending = 'pending', // All new applications are set to Pending on arrival
  Declined = 'declined', // Mentor or Maintainer has declined the application
  Accepted = 'accepted', // Denotes that a Mentee has been accepted into the program
  Withdrawn = 'withdrawn', // Mentee has withdrawn her application to the program
  Graduated = 'graduated', // Mentee has graduated the Mentorship program
}
export const ProjectMemberStatusArray = [
  ProjectMemberStatus.Accepted,
  ProjectMemberStatus.Declined,
  ProjectMemberStatus.Graduated,
  ProjectMemberStatus.Pending,
  ProjectMemberStatus.Withdrawn,
];

export enum ProjectCategoryStatus {
  Pending = 'pending approval', // All new programs are set to Pending on arrival
  Accepted = 'accepting applications', // All programs accepting Mentee applications
  Closed = 'closed applications', // All programs in-progress but not accepting applications
  Declined = 'declined', // Programs rejected by Admin
}
export const ProjectCategoryStatusArray = [
  ProjectCategoryStatus.Pending,
  ProjectCategoryStatus.Accepted,
  ProjectCategoryStatus.Closed,
  ProjectCategoryStatus.Declined,
];

export interface ProjectStatus {
  projectId: string;
  status: string;
  updatedAt: string;
}
