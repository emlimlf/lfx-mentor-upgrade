// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  QueryList,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { delay, filter, startWith } from 'rxjs/operators';
import { StickyTabComponent } from '../sticky-tab/sticky-tab.component';

@Component({
  selector: 'app-sticky-tab-bar',
  templateUrl: './sticky-tab-bar.component.html',
  styleUrls: ['./sticky-tab-bar.component.scss'],
})
export class StickyTabBarComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class') class = 'row mx-0';

  @ContentChildren(StickyTabComponent) tabs!: QueryList<StickyTabComponent>;
  @ViewChild('navList', { static: true }) navList!: ElementRef;
  @ViewChild('navListMobile', { static: true }) navListMobile!: ElementRef;

  @Input() color = '000000';
  @Input() largeTabs = false;
  @Input() baseRoute = '';

  @Input() logoUrl!: string;
  @Input() displayLogo = true;
  @Input() isScrolled = false;

  @Output() changed = new EventEmitter<StickyTabComponent>();

  underlineWidth = '0px';
  underlineOffset = '0px';

  isCollapsed = true;

  selectedTab?: StickyTabComponent;
  private tabSubscription?: Subscription;

  private routerSubscription?: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef, private router: Router) {}

  ngAfterViewInit() {
    // When tabs are added/deleted, we want to make sure there is at least one selected tab,
    // so we listen to any changes in the tabs list.
    this.tabSubscription = this.tabs.changes
      .pipe(
        startWith(0),
        delay(1) // workaround for tabs being selected before their content is available, resulting in a blank content area
      )
      .subscribe(() => {
        this.updateSelectedTab(this.router.url);
      });

    this.routerSubscription = this.router.events
      .pipe(filter((event, _) => event instanceof NavigationEnd))
      .subscribe(event => {
        this.updateSelectedTab((event as RouterEvent).url);
      });
  }

  ngOnDestroy() {
    if (this.tabSubscription !== undefined) {
      this.tabSubscription.unsubscribe();
    }

    if (this.routerSubscription !== undefined) {
      this.routerSubscription.unsubscribe();
    }
  }

  isSelected(tab: StickyTabComponent) {
    return tab === this.selectedTab;
  }

  onToggleDropdown() {
    this.isCollapsed = !this.isCollapsed;
  }

  onSelect(tab: StickyTabComponent) {
    this.isCollapsed = true;
    if (this.selectedTab !== undefined) {
      this.selectedTab.active = false;
    }
    this.selectedTab = tab;
    this.selectedTab.active = true;

    this.updateUnderline();

    this.changed.emit(tab);

    // This forces the view to update.
    this.changeDetectorRef.detectChanges();
  }

  updateUnderline() {
    if (this.selectedTab === undefined) {
      return;
    }

    const index = this.indexForTab(this.selectedTab);
    const navList = this.navList.nativeElement as HTMLElement;

    if (navList !== null) {
      const tabLabel = navList.children.item(index) as HTMLElement;

      this.underlineWidth = `${tabLabel.offsetWidth}px`;
      this.underlineOffset = `${tabLabel.offsetLeft - navList.offsetLeft}px`;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.navListMobile.nativeElement.contains(event.target)) {
      this.isCollapsed = true;
    }
  }

  trackTab(index: number, tab: StickyTabComponent) {
    return index;
  }

  private updateSelectedTab(route: string) {
    const tab = this.tabs.find(item => this.routeMatches(item, route));

    if (tab !== undefined) {
      // If a tab that corresponds to the current route is available, select it.
      this.onSelect(tab);
    } else if (this.tabs.first !== undefined) {
      // If we didn't find any tabs for the current route, just use the first one.
      this.onSelect(this.tabs.first);
    }
  }

  private indexForTab(tab: StickyTabComponent) {
    return this.tabs.toArray().findIndex(t => t === tab);
  }

  private routeMatches(tab: StickyTabComponent, route: string) {
    const paramsIndex = route.indexOf('?');
    let newRoute = route;
    if (paramsIndex !== -1) {
      newRoute = route.slice(0, paramsIndex);
    }

    if (tab.link === './') {
      return newRoute === this.baseRoute;
    }
    return newRoute === `${this.baseRoute}/${tab.link}`;
  }
}
