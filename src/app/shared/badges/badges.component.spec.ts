// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgesComponent } from './badges.component';
import { Component, ViewChild } from '@angular/core';
import { Project, BadgeType } from '@app/core';

@Component({
  template: `
    <app-badges [project]="project"> </app-badges>
  `,
})
class TestHostComponent {
  project: Project;
  @ViewChild(BadgesComponent, { static: true }) item!: BadgesComponent;

  constructor() {
    this.project = {
      badges: [{}],
    } as Project;
  }
}

describe('BadgesComponent', () => {
  let component: BadgesComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BadgesComponent, TestHostComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
