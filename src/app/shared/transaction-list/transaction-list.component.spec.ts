// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Project } from '@app/core';
import { Store } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { of } from 'rxjs';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionListItemComponent } from '../transaction-list-item/transaction-list-item.component';
import { LoaderComponent } from '../loader/loader.component';
import { CentsToDollarsPipe } from '@app/shared/cents-to-dollars.pipe';

@Component({
  template: `
    <app-transaction-list [title]="project"> </app-transaction-list>
  `,
})
class TestHostComponent {
  project: Project;
  @ViewChild(TransactionListComponent, { static: true }) item!: TransactionListComponent;

  constructor() {
    this.project = {
      name: 'The Name',
      id: '12345',
    } as Project;
  }
}

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(
    waitForAsync(() => {
      const store = {
        select: jasmine.createSpy('select').and.returnValue(of()),
        dispatch: jasmine.createSpy('dispatch'),
      };
      TestBed.configureTestingModule({
        declarations: [
          TransactionListComponent,
          TestHostComponent,
          TransactionListItemComponent,
          LoaderComponent,
          CentsToDollarsPipe,
        ],
        imports: [InlineSVGModule.forRoot(), RouterTestingModule],
        providers: [{ provide: Store, useValue: store }],
        schemas: [NO_ERRORS_SCHEMA],
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
