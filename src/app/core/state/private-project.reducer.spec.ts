// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Project, ProjectStatus } from '../models';
import { PrivateProjectLoadedAction } from '../state/private-project.actions';
import { privateProjectsReducer } from '../state/private-project.reducer';

describe('projecsReducer', () => {
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
  const project: Project = {
    id: 'defaultProjectId',
    status: ProjectStatus.SUBMITTED,
    ownerId: 'defaultOwnerId',
    createdOn: new Date(),
    name: 'defaultName',
    industry: 'defaultIndustry',
    description: 'defaultDescription',
    color: 'CCCCCC',
    diversity: defaultDiversity,
    development: defaultDevelopment,
    marketing: defaultMarketing,
    meetups: defaultMeetups,
    travel: defaultTravel,
    apprentice: defaultApprentice,
    projectStats: { backers: 0 }
  };
  it('updates the state of projects when it receives a PROJECT_LOADED action', () => {
    const state = {
      privateProjectList: []
    };
    const projects: Project[] = [project];
    const output = privateProjectsReducer(state, new PrivateProjectLoadedAction(projects));
    expect(output).toEqual({
      privateProjectList: [projects]
    });
  });
});
