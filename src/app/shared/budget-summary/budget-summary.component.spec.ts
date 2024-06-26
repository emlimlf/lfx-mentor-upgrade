// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BudgetColor, Project, ProjectStatus } from '@app/core';
import { ALMOST_2_PI } from '@app/core/utilities';
import { SharedModule } from '@app/shared';
import { InlineSVGModule } from 'ng-inline-svg';
import { BudgetSummaryComponent } from './budget-summary.component';

describe('BudgetSummaryComponent', () => {
  let component: BudgetSummaryComponent;
  let fixture: ComponentFixture<BudgetSummaryComponent>;

  function makeProject(): Project {
    return {
      id: '1234',
      ownerId: '4567',
      status: ProjectStatus.PUBLISHED,
      createdOn: new Date(),
      projectStats: { backers: 0 },
      name: 'Dogchain',
      industry: 'The Industry',
      description: 'The description',
      color: 'CCCCCC',
    };
  }

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [InlineSVGModule.forRoot(), SharedModule],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a single section when only one section has budget', () => {
    const project = makeProject();
    project.marketing = {
      budget: { amount: 100, allocation: 'The allocation' },
    };
    component.project = project;
    component.ngOnChanges();
    expect(component.sections).toEqual([
      {
        color: BudgetColor.MARKETING,
        startAngle: -0.25 * ALMOST_2_PI,
        endAngle: 0.75 * ALMOST_2_PI,
      },
    ]);
  });

  it('should display a two sections when two sections have budget', () => {
    const project = makeProject();
    project.marketing = {
      budget: { amount: 100, allocation: 'The allocation' },
    };
    project.travel = {
      budget: { amount: 100, allocation: 'The allocation' },
    };
    component.project = project;
    component.ngOnChanges();
    expect(component.sections).toEqual([
      {
        color: BudgetColor.MARKETING,
        startAngle: -0.25 * ALMOST_2_PI,
        endAngle: 0.25 * ALMOST_2_PI,
      },
      {
        color: BudgetColor.TRAVEL,
        startAngle: 0.25 * ALMOST_2_PI,
        endAngle: 0.75 * ALMOST_2_PI,
      },
    ]);
  });
});
