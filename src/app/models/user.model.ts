// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Project, ProjectStatus } from '@app/models/project.model';

export interface MentorUser {
  id: string;
  lfid: string;
  avatarUrl: string;
  name: string;
  profiles: Profile[];
  projects: Project[];
  mentees?: { avatarUrl: string }[];
  graduates?: { avatarUrl: string }[];
}

export interface MentorCard {
  id: string;
  topHeaderStyle: { [styleProp: string]: string };
  avatarUrl: string;
  title: string;
  description: string;
  skillTags: string[];
  graduates: { avatarUrl: string }[];
  projects: { logoUrl: string }[];
  apprentices: { avatarUrl: string }[];
  subcardShown: 'projects' | 'skills' | 'description' | null;
}

export interface MenteeUser {
  id: string;
  lfid: string;
  name: string;
  introduction: string;
  avatarUrl: string;
  profiles: Profile[];
  projects: Project[];
  status: ProjectStatus[];
  skills: string[];
  mentors: { name: string; logoUrl: string }[];
}

export interface MenteesResponse {
  mentees: User[];
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  userType?: string;
  userDetails: UserDetails;
}

export interface Profile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  workAuthorized?: boolean;
  address?: Address;
  introduction?: string;
  profileLinks?: ProfileLinks;
  skillSet?: SkillSet;
  projectDetails?: ProjectDetails;
  profileProjects?: ProfileProject[];
  demographics?: UserDemographics;
  socioeconomics?: UserSocioeconomics;
  avatarUrl?: string;
  logoUrl?: string;
  phone?: string;
  termsAndConditions?: boolean;
  projects?: { logoUrl: string }[];
  status?: string;
  joinProjectId?: string;
  mentees?: { name: string; avatarUrl: string }[];
  graduates?: { name: string; avatarUrl: string }[];
  mentors?: { avatarUrl: string }[];
  isByJoinProject?: boolean;
  userId?: string;
}

export interface UserDetails {
  workAuthorized?: boolean;
  address?: Address;
  introduction?: string;
  profileLinks?: ProfileLinks;
  skillSet?: SkillSet;
  demographics?: UserDemographics;
  socioeconomics?: UserSocioeconomics;
  logoUrl?: string;
  phone?: string;
}

export interface Address {
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export interface ProfileLinks {
  linkedinProfileLink?: string;
  githubProfileLink?: string;
  resumeLink?: string;
}

export interface SkillSet {
  skills: string[];
  improvementSkills?: string[];
  comments?: string;
}

export interface UserDemographics {
  age: string;
  race: string;
  gender: string;
}

export interface UserSocioeconomics {
  income: string;
  educationLevel: string;
}

export interface MentorResponse {
  users: MentorUser[];
  nextPageKey: string;
}

export interface MenteeResponse {
  users: MenteeUser[];
  nextPageKey: string;
}

export interface ProjectDetails {
  name: string;
  repositoryUrl: string;
  maintainerName?: string;
  maintainerEmail?: string;
}

export interface ProfileProject {
  name: string;
  id: string;
  status?: string;
}

export interface ApprenticeCard {
  id: string;
  topHeaderStyle: { [styleProp: string]: string };
  fullName: string;
  avatarUrl?: string;
  introduction: string;
  currentSkills: string[];
  desiredSkills: string[];
  projects: Project[];
  mentors: MentorUser[];
}

export interface Relationship {
  myRole: string;
  theirRole: string;
  projectId: string;
}

export enum UserRoles {
  Mentee = 'mentee',
  Mentor = 'mentor',
  Maintainer = 'maintainer',
  Apprentice = 'apprentice',
}
