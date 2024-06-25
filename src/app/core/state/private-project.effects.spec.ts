// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { PrivateProjectsEffects } from './private-project-effects';
import {
  LoadPrivateProjectsAction,
  PrivateProjectLoadedAction,
  PrivateProjectLoadedFailedAction
} from './private-project.actions';
import { Project, ProjectStatus } from '../models';
import { ProjectService } from '../project.service';
function makeProjectService(projects?: Project[]): ProjectService {
  const getProjectsReturnValue = projects === undefined ? cold('#') : cold('a|', { a: projects });
  return {
    getByOwner: jasmine.createSpy('getByOwner').and.returnValues(getProjectsReturnValue)
  } as any;
}

describe('PrivateProjectsEffects', () => {
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

  describe('requestOnLoadProject$', () => {
    it('returns a PrivateProjectLoadedAction on successful backend call', () => {
      const loadAction = new LoadPrivateProjectsAction();
      const projects: Project[] = [project];
      const projectService = makeProjectService(projects);
      const actions = cold('a|', { a: loadAction });
      const effects = new PrivateProjectsEffects(new Actions(actions), projectService);

      const expected = cold('a|', { a: new PrivateProjectLoadedAction(projects) });
      expect(effects.requestOnLoadProject$).toBeObservable(expected);
    });
    it('returns a PrivateProjectLoadedFailedAction on failed backend call', () => {
      const loadAction = new LoadPrivateProjectsAction();
      const projectService = makeProjectService();
      const actions = cold('(a|)', { a: loadAction });
      const effects = new PrivateProjectsEffects(new Actions(actions), projectService);

      const expected = cold('(a|)', { a: new PrivateProjectLoadedFailedAction() });
      expect(effects.requestOnLoadProject$).toBeObservable(expected);
    });
  });
});
