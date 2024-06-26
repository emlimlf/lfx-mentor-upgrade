// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedModule } from '@app/shared';
import { FormCardComponent } from '@app/shared/form-card/form-card.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { FundingIdentityComponent } from './funding-identity.component';

describe('FundingIdentityComponent', () => {
  let component: FundingIdentityComponent;
  let fixture: ComponentFixture<FundingIdentityComponent>;
  const modalService = jasmine.createSpyObj('NgbModal', ['open']);
  const store = {
    select: jasmine.createSpy('select').and.returnValue(of([])),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [
          { provide: NgbModal, useValue: modalService },
          { provide: Store, useValue: store },
        ],
        declarations: [FundingIdentityComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingIdentityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
