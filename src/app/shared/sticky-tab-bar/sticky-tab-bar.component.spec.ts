// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { SubmitButtonComponent } from '@app/shared/submit-button/submit-button.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { StickyTabBarComponent } from './sticky-tab-bar.component';
import { StickyTabComponent } from '../sticky-tab/sticky-tab.component';

@Component({
  selector: 'app-test-component',
  template: `
  <app-sticky-tab-bar>
    <app-sticky-tab label="Tab1"></app-sticky-tab>
    <app-sticky-tab label="Tab2"></app-sticky-tab>
    <app-sticky-tab label="Tab3" link="some-other-route"></app-sticky-tab>
  </app-sticky-tab-bar>
  `
})
class TestHostComponent {}

describe('StickyTabBarComponent', () => {
  let component: StickyTabBarComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  const router = jasmine.createSpyObj('Router', ['navigate']);
  router.events = of({ url: '/account/projects' });
  router.url = 'some-route';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      declarations: [
        StickyTabComponent,
        StickyTabBarComponent,
        TestHostComponent,
        AvatarComponent,
        SubmitButtonComponent
      ],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();
  }));

  beforeEach(() => {
    router.url = '/some-route';
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(By.directive(StickyTabBarComponent)).componentInstance;
    fixture.detectChanges(false);
  });
});
