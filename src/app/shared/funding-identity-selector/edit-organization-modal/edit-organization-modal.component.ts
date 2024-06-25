// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreState, Organization, OrganizationService, UserOrganizationsLoadedAction } from '@app/core';
import { LogoFieldComponent } from '@app/shared/logo-field/logo-field.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  ConnectableObservable,
  defer,
  Observable,
  of,
  Subscription
} from 'rxjs';
import { map, publishBehavior, publishLast, refCount, shareReplay, startWith } from 'rxjs/operators';
import { SubmitState } from '../../submit-button/submit-button.component';

export enum EditOrganizationResult {
  ORGANIZATION_SAVED,
  DISMISSED
}

@Component({
  selector: 'app-edit-organization-modal',
  templateUrl: './edit-organization-modal.component.html',
  styleUrls: ['./edit-organization-modal.component.scss']
})
export class EditOrganizationModalComponent implements OnInit, OnDestroy {
  @Input() organization?: Organization;

  @ViewChild(LogoFieldComponent) logoField!: LogoFieldComponent;

  submitState$: Observable<SubmitState>;
  avatarUrl?: string;

  form: FormGroup;

  private baseState$ = new BehaviorSubject<SubmitState.READY | SubmitState.SUBMITTING | SubmitState.SUCCESS>(
    SubmitState.READY
  );

  private formCompleted$ = new Observable<boolean>();
  private subscription?: Subscription;

  constructor(
    public activeModal: NgbActiveModal,
    formBuilder: FormBuilder,
    private organizationService: OrganizationService
  ) {
    this.form = formBuilder.group({
      name: ['', [Validators.required]],
      logo: ['', [Validators.required]]
    });

    const initialValidity = defer(() => of(this.form.valid));
    this.formCompleted$ = concat(initialValidity, this.form.statusChanges.pipe(map(_ => this.form.valid)));

    this.submitState$ = combineLatest(
      [this.baseState$, this.formCompleted$],
      (state: SubmitState, completed: boolean) => this.getSubmitButtonState(state, completed)
    );
  }

  ngOnInit() {
    if (this.organization !== undefined) {
      this.form.setValue({ name: this.organization.name, logo: this.organization.avatarUrl });
      this.avatarUrl = this.organization.avatarUrl;
    }
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  close() {
    return this.activeModal.close(EditOrganizationResult.DISMISSED);
  }

  saveOrganization() {
    let updatedOrg$: Observable<Organization>;
    const name = this.form.controls['name'].value as string;
    const file = this.logoField.selectedFile;

    if (this.organization === undefined) {
      if (file === undefined) {
        return;
      }
      updatedOrg$ = this.organizationService.createOrganization(name, file);
    } else {
      updatedOrg$ = this.organizationService.updateOrganization(this.organization, name, file);
    }

    this.baseState$.next(SubmitState.SUBMITTING);

    this.subscription = updatedOrg$.subscribe(
      _ => {
        this.activeModal.close(EditOrganizationResult.ORGANIZATION_SAVED);
      },
      _ => {
        // TODO Log error here
        this.baseState$.next(SubmitState.READY);
      }
    );
  }

  private getSubmitButtonState(originalState: SubmitState, formCompleted: boolean) {
    if (originalState === SubmitState.READY && !formCompleted) {
      return SubmitState.DISABLED;
    }
    return originalState;
  }
}
