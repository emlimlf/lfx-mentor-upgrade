// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreState, Identity, LoadingStatus, LoadUserOrganizationsAction, Organization } from '@app/core';
import { getUserInfoState } from '@app/core/state/auth.reducer';
import { organizationSelector } from '@app/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { NEVER, Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import {
  EditOrganizationModalComponent,
  EditOrganizationResult,
} from './edit-organization-modal/edit-organization-modal.component';

export const INDIVIDUAL_FUNDING_IDENTITY = 'individual';

@Component({
  selector: 'app-funding-identity-selector',
  templateUrl: './funding-identity-selector.component.html',
  styleUrls: ['./funding-identity-selector.component.scss'],
})
export class FundingIdentitySelectorComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() controlName = '';
  @Input() locked = false;

  userIdentity$: Observable<Identity>;
  organizations$: Observable<Organization[]>;

  get currentValue() {
    return this.parentForm.controls[this.controlName].value as string;
  }

  constructor(private modalService: NgbModal, private store: Store<CoreState>) {
    this.organizations$ = store.select(organizationSelector).pipe(
      map(entry => {
        if (entry.status === LoadingStatus.LOADED) {
          return entry.entry;
        }
        return [];
      })
    );
    this.userIdentity$ = store.select(getUserInfoState).pipe(
      mergeMap(state => {
        if (state === undefined) {
          return NEVER;
        }
        return of(state);
      })
    );
  }

  ngOnInit() {}

  async editOrganization(organization?: Organization) {
    const modalRef = this.modalService.open(EditOrganizationModalComponent, {
      centered: true,
      windowClass: 'no-border modal-window',
    });

    const organizationComp = modalRef.componentInstance as EditOrganizationModalComponent;
    organizationComp.organization = organization;

    const result = await (modalRef.result as Promise<EditOrganizationResult>);
    if (result === EditOrganizationResult.ORGANIZATION_SAVED) {
      this.store.dispatch(new LoadUserOrganizationsAction());
    }
  }
}
