// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit } from '@angular/core';
import { CoreState, LoadingStatus, LoadUserOrganizationsAction, Organization, organizationSelector } from '@app/core';
import { EditOrganizationModalComponent, EditOrganizationResult } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-funding-identity',
  templateUrl: './funding-identity.component.html',
  styleUrls: ['./funding-identity.component.scss']
})
export class FundingIdentityComponent implements OnInit {
  @Input() loading = false;

  organizations$: Observable<Organization[]>;

  constructor(private modalService: NgbModal, private store: Store<CoreState>) {
    this.organizations$ = store.select(organizationSelector).pipe(
      map(entry => {
        if (entry.status === LoadingStatus.LOADED) {
          return entry.entry;
        }
        return [];
      })
    );
  }

  ngOnInit() {}

  async editOrganization(organization?: Organization) {
    const modalRef = this.modalService.open(EditOrganizationModalComponent, {
      centered: true,
      windowClass: 'no-border modal-window'
    });

    const organizationComp = modalRef.componentInstance as EditOrganizationModalComponent;
    organizationComp.organization = organization;

    const result = await (modalRef.result as Promise<EditOrganizationResult>);
    if (result === EditOrganizationResult.ORGANIZATION_SAVED) {
      this.store.dispatch(new LoadUserOrganizationsAction());
    }
  }

  trackOrganization(_: number, item: Organization) {
    return item.id;
  }
}
