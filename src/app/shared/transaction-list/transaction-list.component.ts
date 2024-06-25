// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ProjectSubscription } from './../../core/models/project.model';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CoreState,
  createTransactionsPageSelector,
  createTransactionsSelector,
  getObservableQueryParam,
  LoadingStatus,
  Project,
  RemoteDataLoaded,
  Transaction,
  TransactionPageModel,
  TransactionsModel,
} from '@app/core';
import { Store } from '@ngrx/store';
import { combineLatest, NEVER, Observable, of, Subscription } from 'rxjs';
import { filter, flatMap, map, skip, take } from 'rxjs/operators';

interface PageStats {
  startIndex: number;
  endIndex: number;
}

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
})
export class TransactionListComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() pageRoute = '';
  @ViewChild('headerTitle', { static: true }) headerTitle!: ElementRef;

  transactions$: Observable<Transaction[]>;
  loading$: Observable<boolean>;
  hasNextPage$: Observable<boolean>;
  hasPreviousPage$: Observable<boolean>;
  nextCursor$: Observable<string | undefined>;
  previousCursor$: Observable<string | undefined>;
  pageStats$: Observable<PageStats>;

  private subscription: Subscription;

  constructor(private store: Store<CoreState>, private state: ActivatedRoute) {
    const cursor$ = getObservableQueryParam(state, 'cursor');

    this.subscription = cursor$.pipe(skip(1)).subscribe(() => this.scrollTopOfWidget());

    const currentPage$ = cursor$.pipe(flatMap(cursor => store.select(createTransactionsPageSelector(cursor))));
    this.loading$ = currentPage$.pipe(map(page => page.status === LoadingStatus.LOADING));

    this.nextCursor$ = currentPage$.pipe(
      map(page => {
        if (page.status !== LoadingStatus.LOADED) {
          return undefined;
        }
        return page.entry.nextCursor;
      })
    );

    this.previousCursor$ = currentPage$.pipe(
      map(page => {
        if (page.status !== LoadingStatus.LOADED) {
          return undefined;
        }
        return page.entry.previousCursor;
      })
    );

    this.hasNextPage$ = this.nextCursor$.pipe(map(cursor => cursor !== undefined));
    this.hasPreviousPage$ = this.previousCursor$.pipe(map(cursor => cursor !== undefined));
    this.pageStats$ = currentPage$.pipe(
      filter(page => page.status === LoadingStatus.LOADED),
      map(page => {
        const loadedPage = page as RemoteDataLoaded<TransactionPageModel>;
        const firstIndex = loadedPage.entry.firstIndex !== undefined ? loadedPage.entry.firstIndex : 0;
        return {
          startIndex: firstIndex,
          endIndex: firstIndex + loadedPage.entry.currentTransactionIds.length - 1,
        };
      })
    );

    this.transactions$ = currentPage$.pipe(
      flatMap(page => {
        if (page.status === LoadingStatus.LOADED) {
          return this.getTransactionsFromIds(page.entry.currentTransactionIds);
        }
        return NEVER;
      })
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  trackTransaction(_: number, transaction: Transaction) {
    return transaction.id;
  }

  scrollTopOfWidget() {
    const nativeElement = this.headerTitle.nativeElement as HTMLElement;
    nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  private getTransactionsFromIds(transactionIds: string[]): Observable<Transaction[]> {
    if (transactionIds.length === 0) {
      return of([]);
    }
    const ts = transactionIds.map(id => this.store.select(createTransactionsSelector(id)));
    return combineLatest(ts).pipe(map(models => this.getTransactionsFromModel(models)));
  }

  private getTransactionsFromModel(models: TransactionsModel[]) {
    return models.map(model => model.transaction).filter(trs => trs !== undefined) as Transaction[];
  }
}
