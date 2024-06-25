// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Project, ProjectStatus } from '@app/core';
import { estimateProjectBudget } from './est-project-budget';

describe('estAnnualBudget', () => {
  it('calculates a project budget when all sections are defined', () => {
    const devBudget = { allocation: 'Test Allocation', amount: 1000020 };
    const marketingBudget = { allocation: 'Test Allocation', amount: 5 };
    const meetupsBudget = { allocation: 'Test Allocation', amount: 20000 };
    const travelBudget = { allocation: 'Test Allocation', amount: 10000000 };
    const apprenticeBudget = { allocation: 'Test Allocation', amount: 234234 };

    const project: Project = {
      id: 'some-id',
      ownerId: 'ownerId',
      status: ProjectStatus.SUBMITTED,
      name: 'Dogchain',
      description: 'Blockchain for dogs, by dogs',
      industry: 'Blockchain',
      createdOn: new Date(),
      color: 'CCCCCC',
      diversity: {
        malePercentage: 30,
        femalePercentage: 40,
        unknownPercentage: 30
      },
      development: {
        repoLink: 'https://github.com/test',
        budget: devBudget
      },
      marketing: {
        budget: marketingBudget
      },
      meetups: {
        budget: meetupsBudget
      },
      travel: {
        budget: travelBudget
      },
      apprentice: {
        budget: apprenticeBudget,
        mentor: [{ name: 'user', email: 'user@example' }],
        termsConditions: true
      },
      projectStats: { backers: 0 }
    };

    const output = estimateProjectBudget(project);
    const expected =
      (devBudget.amount +
        marketingBudget.amount +
        meetupsBudget.amount +
        travelBudget.amount +
        apprenticeBudget.amount) /
      100;
    expect(output).toEqual(expected);
  });
  it('calculates a project budget when no sections are defined', () => {
    const project: Project = {
      id: 'some-id',
      ownerId: 'ownerId',
      status: ProjectStatus.SUBMITTED,
      name: 'Dogchain',
      description: 'Blockchain for dogs, by dogs',
      industry: 'Blockchain',
      createdOn: new Date(),
      color: 'CCCCCC',
      projectStats: { backers: 0 }
    };

    const output = estimateProjectBudget(project);
    expect(output).toEqual(0);
  });
  it('calculates a project budget with some sections defined', () => {
    const devBudget = { allocation: 'Test Allocation', amount: 3000 };
    const travelBudget = { allocation: 'Test Allocation', amount: 12345 };

    const project: Project = {
      id: 'some-id',
      ownerId: 'ownerId',
      status: ProjectStatus.SUBMITTED,
      name: 'Dogchain',
      description: 'Blockchain for dogs, by dogs',
      industry: 'Blockchain',
      createdOn: new Date(),
      color: 'CCCCCC',
      diversity: {
        malePercentage: 30,
        femalePercentage: 40,
        unknownPercentage: 30
      },
      development: {
        repoLink: 'https://github.com/test',
        budget: devBudget
      },
      travel: {
        budget: travelBudget
      },
      projectStats: { backers: 0 }
    };

    const output = estimateProjectBudget(project);
    const expected = (devBudget.amount + travelBudget.amount) / 100;
    expect(output).toEqual(expected);
  });
});
