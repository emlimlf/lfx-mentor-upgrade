import { Component, OnDestroy, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, Observable, timer, merge, of } from 'rxjs';
import { debounce, switchMap, map, takeUntil, tap, catchError, filter } from 'rxjs/operators';
import { UserService } from '@app/services/user.service';
import { EmployerService } from '@app/services/employer.service';
import { Project } from '@app/models/project.model';
import { Router } from '@angular/router';
import { DownloadService } from '@app/services/download.service';
import { MenteeService } from '@app/services/mentee.service';
import { PaginationService } from '@app/services/pagination.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

const PROJECT_SEARCH_ENDPOINT = `${environment.API_URL}projects/search`;
const MENTOR_SEARCH_ENDPOINT = `${environment.API_URL}mentors/search`;
const MENTEE_SEARCH_ENDPOINT = `${environment.API_URL}mentees/search`;

@Component({
  selector: 'app-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss'],
})
export class InputSearchComponent implements OnDestroy, OnChanges {
  @Input() type: 'project' | 'mentors' | 'mentees' | 'employers' = 'project';
  @Input() subType: 'all' | 'accepting' | 'in-progress' | 'closed' = 'all';
  @Input() hideList = false;
  @Input() projectsFilterFun!: (filterText: string, isSearchComponent: boolean) => any[];
  @Output() filter = new EventEmitter();

  showMore = false;
  projectListFilter = '';
  projectListFilterListerner$ = new Subject();
  filteredProjectList$: Observable<Project[] | null> = new Observable();
  search$: Observable<Project[] | null> = new Observable();
  clear$: Subject<null> = new Subject();
  destroy$ = new Subject();
  isLoading = false;
  showList = false;
  projectEnter = false;

  constructor(
    // private projectService: ProjectService,
    private userService: UserService,
    private employerService: EmployerService,
    private downloadService: DownloadService,
    private router: Router,
    private menteeService: MenteeService,
    private httpClient: HttpClient,
    private pagination: PaginationService
  ) {
    this.addListenerProjectSearch();
    const route = `${environment.API_URL}projects/search`;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.subType && !changes.subType.firstChange) {
      // if (this.projectListFilter) {
      this.projectListFilter = '';
      if (this.projectEnter) {
        this.onProjectSearchEnter();
      }
      this.projectListFilterListerner$.next(this.projectListFilter);
      // }
    }
  }
  addListenerProjectSearch() {
    this.search$ = this.projectListFilterListerner$.pipe(
      // distinctUntilChanged(),
      map((value: any) => value),
      // if character length greater than or equal to 3
      filter(res => res.length >= 3 || res.length === 0),
      tap(() => {
        this.isLoading = true;
        this.showList = false;
        this.projectEnter = false;
      }),
      debounce(() => timer(350)),
      switchMap((value: any) => this.getPageFromType(value)),
      map((page: any) => {
        if (this.type === 'project') {
          if (page.nextPageKey) {
            this.showMore = true;
          } else {
            this.showMore = false;
          }
          return page.projects && page.projects.length ? page.projects : null;
        } else if (this.type === 'mentors') {
          if (page.nextPageKey) {
            this.showMore = true;
          } else {
            this.showMore = false;
          }
          return page.users && page.users.length ? page.users : null;
        } else if (this.type === 'mentees') {
          if (page.nextPageKey) {
            this.showMore = true;
          } else {
            this.showMore = false;
          }
          return page.users && page.users.length ? page.users : null;
        } else {
          if (page.nextPageKey) {
            this.showMore = true;
          } else {
            this.showMore = false;
          }
          return page.employers && page.employers.length ? page.employers : null;
        }
      }),
      tap(() => {
        this.isLoading = false;
        this.showList = !!this.projectListFilter;
      }),
      takeUntil(this.destroy$),
      catchError(err => {
        this.isLoading = false;
        return of(null);
      })
    );

    this.filteredProjectList$ = merge(this.clear$, this.search$);
  }

  getPageFromType(value: string): Observable<any> {
    if (this.type === 'project' && value) {
      let programTermStatus;
      let acceptingApplications = false;
      switch (this.subType) {
        case 'accepting':
          programTermStatus = 'open';
          acceptingApplications = true;
          break;
        case 'in-progress':
          programTermStatus = 'open';
          acceptingApplications = false;
          break;
        case 'closed':
          programTermStatus = 'closed';
          acceptingApplications = false;
          break;
      }

      return this.pagination
        .getSearchResults(PROJECT_SEARCH_ENDPOINT, false, value, programTermStatus, acceptingApplications)
        .pipe(
          map(data => data.hits),
          map(items => {
            return {
              projects:
                items &&
                items.map((project: any) => {
                  return {
                    ...project._source,
                    path: '/project/' + project._source.projectId,
                  };
                }),
            };
          })
        );
    }
    if (this.type === 'mentors') {
      return this.pagination.getSearchResults(MENTOR_SEARCH_ENDPOINT, false, value).pipe(
        map(data => data.hits),
        map(items => {
          return {
            users:
              items &&
              items.map((user: any) => {
                if (!user._source.avatarUrl || (user._source.avatarUrl as string).includes('s.gravatar')) {
                  user._source.avatarUrl = encodeURI(
                    this.downloadService._defaultLogo({ first: user._source.name, last: '' })
                  );
                }
                return {
                  ...user._source,
                  path: '/mentor/' + user._source.id,
                };
              }),
          };
        })
      );
    } else if (this.type === 'mentees') {
      return this.pagination.getSearchResults(MENTEE_SEARCH_ENDPOINT, false, value).pipe(
        map(data => data.hits),
        map(items => {
          return {
            users:
              items &&
              items.map((user: any) => {
                if (!user._source.avatarUrl || (user._source.avatarUrl as string).includes('s.gravatar')) {
                  user._source.avatarUrl = encodeURI(
                    this.downloadService._defaultLogo({ first: user._source.name, last: '' })
                  );
                }
                return {
                  ...user._source,
                  path: '/mentee/' + user._source.id,
                };
              }),
          };
        })
      );
    } else if (this.type === 'employers') {
      return this.employerService.getEmployers('9', undefined, undefined, 'approved', value);
    } else {
      return of([]);
    }
  }

  onProjectSearchEnter() {
    if (this.type === 'project') {
      this.projectEnter = true;
    }
    this.updateParentList();
  }

  updateParentList() {
    this.filter.emit(this.projectListFilter);
    this.showList = false;
  }

  clearSearch() {
    this.clear$.next(null);
    this.projectListFilter = '';
    this.showList = false;
    this.filter.emit('');
  }

  trackby(item: any) {
    return item.path;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  navigateTo(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    } else {
      this.showList = false;
      this.projectListFilter = item.name || item.companyName;
      this.onProjectSearchEnter();
    }
  }
}
