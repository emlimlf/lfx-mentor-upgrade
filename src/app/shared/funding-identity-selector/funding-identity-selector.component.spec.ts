// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Identity, LoadingStatus, OrganizationModel } from '@app/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { FundingIdentitySelectorComponent } from './funding-identity-selector.component';
import { SharedModule } from '../shared.module';

@Component({
  template: `
    <app-funding-identity-selector [parentForm]="group" [controlName]="'identity'"> </app-funding-identity-selector>
  `,
})
class TestHostComponent {
  @ViewChild(FundingIdentitySelectorComponent, { static: true }) item!: FundingIdentitySelectorComponent;
  readonly group: FormGroup;

  constructor() {
    this.group = new FormGroup({});
    this.group.addControl('identity', new FormControl());
  }
}
describe('FundingIdentitySelectorComponent', () => {
  let component: FundingIdentitySelectorComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(
    waitForAsync(() => {
      const organizationsModal = new BehaviorSubject<OrganizationModel>({ status: LoadingStatus.LOADING });
      const identity = new BehaviorSubject<Identity>({ name: 'Google', avatarUrl: 'https://someurl.com/avatar' });

      const store = {
        select: jasmine.createSpy('select').and.returnValues(organizationsModal, identity),
      };

      const modalService = jasmine.createSpyObj('NgbModal', ['open']);

      TestBed.configureTestingModule({
        declarations: [TestHostComponent],
        imports: [SharedModule, ReactiveFormsModule],
        providers: [
          { provide: NgbModal, useValue: modalService },
          { provide: Store, useValue: store },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
