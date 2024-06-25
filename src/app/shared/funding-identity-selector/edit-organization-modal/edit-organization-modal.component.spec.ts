// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { OrganizationService } from '@app/core';
import { SharedModule } from '@app/shared';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditOrganizationModalComponent } from './edit-organization-modal.component';

describe('EditCardModalComponent', () => {
  let component: EditOrganizationModalComponent;
  let fixture: ComponentFixture<EditOrganizationModalComponent>;

  beforeEach(async(() => {
    const organizationService = {
      createOrganization: jasmine.createSpy('createOrganization').and.returnValue({}),
      updateOrganization: jasmine.createSpy('updateOrganization').and.returnValue({})
    };

    TestBed.configureTestingModule({
      imports: [NgbModule.forRoot(), SharedModule, ReactiveFormsModule],
      providers: [NgbActiveModal, { provide: OrganizationService, useValue: organizationService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrganizationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
