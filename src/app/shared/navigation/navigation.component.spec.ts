// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  ACCOUNT_ROUTE,
  AuthService,
  GoAction,
  LANDING_ROUTE,
  LoggerService,
  PROJECT_CREATE_ROUTE,
  PROJECT_ROUTE,
  TriggerLoginAction
} from '@app/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject, of } from 'rxjs';
import { NavigationComponent } from './navigation.component';
import { NavigationToggleComponent } from '../navigation-toggle/navigation-toggle.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let authService: Partial<AuthService>;
  let store: Store<any>;
  let loggedIn: BehaviorSubject<boolean>;
  let router: Router;

  beforeEach(async(() => {
    loggedIn = new BehaviorSubject<boolean>(false);
    const loggerService: LoggerService = jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']);
    const webAuth = jasmine.createSpyObj('WebAuth', ['authorize']);
    const httpClient = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;
    authService = {
      ...new AuthService(webAuth, loggerService, httpClient, ''),
      authenticateWithTargetRoute: jasmine.createSpy('authorize')
    };

    store = {
      dispatch: jasmine.createSpy('dispatch'),
      select: jasmine.createSpy('select').and.returnValue(loggedIn)
    } as any;

    router = {
      // Create a mock observable of router events
      events: of({ url: '/projects' })
    } as any;

    TestBed.configureTestingModule({
      declarations: [NavigationComponent, NavigationToggleComponent],
      imports: [NgbModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Store, useValue: store },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call TRIGGER_LOGIN when sign in is pressed', () => {
    component.onLogIn();
    expect(store.dispatch).toHaveBeenCalledWith(new TriggerLoginAction(['/']));
  });

  it('should call GO_ACTION when apply is pressed', () => {
    component.onApply();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([PROJECT_CREATE_ROUTE]));
  });

  it('should call GO_ACTION when discover is pressed', () => {
    component.onDiscover();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([PROJECT_ROUTE]));
  });

  it('should call GO_ACTION when home is pressed', () => {
    component.onHome();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([LANDING_ROUTE]));
  });

  it('should call GO_ACTION when my projects is pressed', () => {
    component.onMyProjects();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([`${ACCOUNT_ROUTE}/projects`]));
  });

  it('should call GO_ACTION when my subscriptions is pressed', () => {
    component.onMySubscriptions();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([`${ACCOUNT_ROUTE}/subscriptions`]));
  });

  it('should call GO_ACTION when my profile is pressed', () => {
    component.onMyProfile();
    expect(store.dispatch).toHaveBeenCalledWith(new GoAction([`${ACCOUNT_ROUTE}/profile`]));
  });

  it('updates loggedOut$ state', () => {
    const output = cold('(a)', { a: false });
    loggedIn.next(true);
    expect(component.loggedOut$).toBeObservable(output);
  });
});
