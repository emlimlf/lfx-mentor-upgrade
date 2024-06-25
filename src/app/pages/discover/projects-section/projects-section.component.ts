import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import hexRgb from 'hex-rgb';
import {
  Project,
  ProjectResponse,
  ProjectCard,
  ProjectCategoryStatusArray,
  ProjectCategoryStatus,
} from '@app/models/project.model';
import { DEFAULT_PAGE_SIZE, ORDER_BY_ASCENDING, PROJECT_DEFAULT_SORT_NAME } from '@app/core';
import { MenteeService } from '@app/services/mentee.service';
import { MentorService } from '@app/services/mentor.service';
import { PaginationService } from '@app/services/pagination.service';
import { environment } from 'environments/environment';
import { fadeInTop, listStagger } from '@app/shared/general-animations';

const PRIVATE_PROJECT_PAGINATE_ENDPOINT = `${environment.API_URL}projects/cache/private`;

@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.scss'],
  animations: [listStagger, fadeInTop],
})
export class ProjectsSectionComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();
  // Project list page
  initalValue: ProjectResponse = { projects: [], nextPageKey: '' };
  projects$ = new BehaviorSubject<Project[]>([]);
  projectPageOffset$ = new BehaviorSubject<number>(1);
  nextPageKey$ = new BehaviorSubject<string>('');

  menteeProjects$ = new BehaviorSubject<{ [id: string]: Project }>({});
  menteeProjectPageOffset$ = new BehaviorSubject<number>(1);
  menteeNextPageKey$ = new BehaviorSubject<string>('');

  mentorProjects$ = new BehaviorSubject<{ [id: string]: Project }>({});
  mentorProjectPageOffset$ = new BehaviorSubject<number>(1);
  mentorNextPageKey$ = new BehaviorSubject<string>('');

  myProjectCards: ProjectCard[] = [];
  myProjectCardsLoaded = false;
  canLoadMoreMyProjects = true;
  totalFetchedCountMyProjects = 0;
  filterMyProjects: any;
  searchMyProjects = '';
  myProjectsStatus = '';

  myMenteeProjectCards?: (ProjectCard | undefined)[];
  myMenteeProjectCardsLoaded = false;

  myMentorProjectCards?: (ProjectCard | undefined)[];
  myMentorProjectCardsLoaded = false;

  shouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  shouldShowNextMenteeButton$ = new BehaviorSubject<boolean>(false);

  shouldShowNextMentorButton$ = new BehaviorSubject<boolean>(false);
  showJumpToTopIcon = false;
  filter = {
    label: 'Status',
    field: 'status',
    options: ProjectCategoryStatusArray,
    value: '',
  };

  constructor(
    private menteeService: MenteeService,
    private mentorService: MentorService,
    private paginationService: PaginationService
  ) {}

  ngOnInit() {
    // Loading project data from server

    this.nextPageKey$.pipe(map(Boolean), takeUntil(this.unsubscribe$)).subscribe(this.shouldShowNextButton$);

    this.paginate(PRIVATE_PROJECT_PAGINATE_ENDPOINT);

    this.menteeNextPageKey$
      .pipe(map(Boolean), takeUntil(this.unsubscribe$))
      .subscribe(this.shouldShowNextMenteeButton$);

    this.getMenteeProjectCards('9')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (projectCards: ProjectCard[]) => {
          this.myMenteeProjectCards = projectCards;
        },
        error => {
          this.myMenteeProjectCards = [];
          this.myMenteeProjectCardsLoaded = true;
        }
      );

    this.mentorNextPageKey$
      .pipe(map(Boolean), takeUntil(this.unsubscribe$))
      .subscribe(this.shouldShowNextMentorButton$);

    this.getMentorProjectCards('9')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (projectCards: ProjectCard[]) => {
          this.myMentorProjectCards = projectCards;
        },
        error => {
          this.myMentorProjectCards = [];
          this.myMentorProjectCardsLoaded = true;
        }
      );
  }

  @HostListener('window:scroll') // for window scroll events
  onScroll() {
    this.showJumpToTopIcon = window.scrollY > 180;
  }

  private getMenteeProjectCards(limit?: string, nextPageKey?: string): Observable<any> {
    const menteeId = localStorage.getItem('userId') as string;
    let serviceLimit;
    if (limit) {
      serviceLimit = +limit;
    }
    //const displayActives = true;
    this.myMenteeProjectCardsLoaded = false;
    return this.menteeService.getMenteePrivateProjects(menteeId, serviceLimit, nextPageKey).pipe(
      switchMap((projectResponse: ProjectResponse): any => {
        if (!projectResponse.projects || projectResponse.projects.length === 0) {
          this.myMenteeProjectCardsLoaded = true;
          this.menteeNextPageKey$.next(projectResponse.nextPageKey);
          return of([]);
        }

        const { nextPageKey, projects: projectsArr } = projectResponse;
        const projects = projectsArr.reduce(
          (obj, project) => ({
            ...obj,
            [project.projectId]: project,
          }),
          {}
        );

        this.menteeProjects$ = new BehaviorSubject<{ [id: string]: Project }>({});
        const accumulatedProjects = {
          ...this.menteeProjects$.getValue(),
          ...(projects || {}),
        };

        let projectCards$ = of([] as ProjectCard[]);

        if (Object.keys(accumulatedProjects).length) {
          projectCards$ = this.menteeProjects$.pipe(
            map((projects: { [id: string]: Project }): ProjectCard[] =>
              Object.values(projects).reduce((all: ProjectCard[], project): ProjectCard[] => {
                if (project) {
                  let arraySize = all.push(this.projectToProjectCard(project));

                  if (projectResponse.acceptanceStatusList) {
                    for (let i = 0; i < projectResponse.acceptanceStatusList.length; i++) {
                      if (projectResponse.acceptanceStatusList[i].projectId === project.projectId) {
                        all[arraySize - 1].acceptanceStatus = projectResponse.acceptanceStatusList[i].status;
                      }
                    }
                  }
                }
                return all;
              }, [])
            )
          );
        }

        this.menteeNextPageKey$.next(nextPageKey);
        this.menteeProjects$.next(accumulatedProjects);

        this.myMenteeProjectCardsLoaded = true;

        return projectCards$;
      })
    );
  }

  private getMentorProjectCards(limit?: string, nextPageKey?: string): Observable<any> {
    const menteeId = localStorage.getItem('userId') as string;
    this.myMentorProjectCardsLoaded = false;
    return this.mentorService.getMentorProjects(menteeId, limit, nextPageKey).pipe(
      switchMap((projectResponse: ProjectResponse): any => {
        if (!projectResponse.projects) {
          this.myMentorProjectCardsLoaded = true;
          this.mentorNextPageKey$.next(projectResponse.nextPageKey);
          return of([]);
        }

        const { nextPageKey, projects: projectsArr } = projectResponse;
        const projects = projectsArr.reduce(
          (obj, project) => ({
            ...obj,
            [project.projectId]: project,
          }),
          {}
        );

        const accumulatedProjects = {
          ...this.mentorProjects$.getValue(),
          ...(projects || {}),
        };

        let projectCards$ = of([] as ProjectCard[]);

        if (Object.keys(accumulatedProjects).length) {
          projectCards$ = this.mentorProjects$.pipe(
            map((projects: { [id: string]: Project }): ProjectCard[] =>
              Object.values(projects).reduce((all: ProjectCard[], project): ProjectCard[] => {
                if (project) {
                  all.push(this.projectToProjectCard(project));
                }

                return all;
              }, [])
            )
          );
        }

        this.mentorNextPageKey$.next(nextPageKey);
        this.mentorProjects$.next(accumulatedProjects);

        this.myMentorProjectCardsLoaded = true;

        return projectCards$;
      })
    );
  }

  onClickMenteeProjectNext() {
    const pageKey = this.menteeNextPageKey$.getValue();

    if (!pageKey) {
      return;
    }

    this.getMenteeProjectCards('9', pageKey)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((projectCards: ProjectCard[]) => {
        this.myMenteeProjectCards = projectCards;
      });
  }

  onClickMentorProjectNext() {
    const pageKey = this.mentorNextPageKey$.getValue();

    if (!pageKey) {
      return;
    }

    this.getMentorProjectCards('9', pageKey)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (projectCards: ProjectCard[]) => {
          this.myMentorProjectCards = projectCards;
        },
        err => {
          this.myMentorProjectCardsLoaded = true;
        }
      );
  }

  refreshMenteeProjects(data: boolean) {
    if (data) {
      this.getMenteeProjectCards('9')
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (projectCards: ProjectCard[]) => {
            this.myMenteeProjectCards = projectCards;
          },
          error => {
            this.myMenteeProjectCardsLoaded = true;
          }
        );
    }
  }

  onClickProjectNext() {
    if (this.canLoadMoreMyProjects) {
      const pageKey = this.nextPageKey$.getValue();
      if (!pageKey) {
        return;
      }

      this.nextPageKey$.next('');
      this.totalFetchedCountMyProjects += DEFAULT_PAGE_SIZE;
      const accepting =
        this.filterMyProjects === ProjectCategoryStatus.Accepted
          ? true
          : this.filterMyProjects === ProjectCategoryStatus.Closed
          ? false
          : '';
      this.paginate(
        PRIVATE_PROJECT_PAGINATE_ENDPOINT,
        this.totalFetchedCountMyProjects,
        DEFAULT_PAGE_SIZE,
        PROJECT_DEFAULT_SORT_NAME,
        ORDER_BY_ASCENDING,
        this.myProjectsStatus,
        this.searchMyProjects,
        accepting ? accepting : undefined
      );
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private projectToProjectCard(project: Project): ProjectCard {
    const terms = project.programTerms;
    const rgbString = this.getProjectCardColor(project);
    const mentors = project.apprenticeNeeds.mentors ? project.apprenticeNeeds.mentors : [];
    const opportunities = project.opportunities ? project.opportunities : [];

    return {
      ...(project as any),
      projectId: project.projectId,
      subcardShown: null,
      topHeaderStyle: {
        fill: rgbString,
      },
      logoUrl: project.logoUrl,
      tags: project.industry.split(','),
      title: project.name,
      description: project.description,
      status: project.status,
      terms,
      opportunities,
      mentors,
      acceptApplications: project.acceptApplications,
      programTermStatus: project.programTermStatus,
      amountRaised: project.amountRaised,
    };
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private getProjectCardColor(project: Project): string {
    if (!project.color) {
      return 'rgb(128, 128, 128)';
    }

    const { red, green, blue } = hexRgb(project.color);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  private getOpportunitiesForProject(project: Project): { logoUrl: string | null }[] {
    // TODO Get opportunities data when it becomes available
    return (project && project.opportunities) || [];
  }

  isPageLoading() {
    return !this.myProjectCards || !this.myMenteeProjectCards || !this.myMentorProjectCards;
  }

  jumpTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canJumpTop() {
    return (
      (this.myProjectCards && this.myProjectCards.length !== 0) ||
      (this.myMenteeProjectCards && this.myMenteeProjectCards.length !== 0) ||
      (this.myMentorProjectCards && this.myMentorProjectCards.length !== 0)
    );
  }

  private paginate(
    endpoint: string,
    from: number = 0,
    size: number = DEFAULT_PAGE_SIZE,
    sortBy: string = PROJECT_DEFAULT_SORT_NAME,
    orderBy: string = ORDER_BY_ASCENDING,
    status: string = '',
    filterBy: string = '',
    accepting: boolean = true
  ) {
    this.canLoadMoreMyProjects = false;
    const myProjects: ProjectCard[] = [];

    let extraParams = new HttpParams();
    extraParams = extraParams.set('status', status);
    extraParams = extraParams.set('filter', filterBy);
    if (status === 'Published') {
      extraParams = extraParams.set('accepting', accepting.toString());
    }
    this.myProjectCardsLoaded = false;

    this.paginationService.getPage(endpoint, extraParams, from, size, sortBy, orderBy).subscribe(
      (data: any) => {
        const { hits, total } = data;

        hits.forEach((item: any) => {
          myProjects.push(this.projectToProjectCard(item._source));
        });

        if (this.totalFetchedCountMyProjects + DEFAULT_PAGE_SIZE < total.value) {
          this.nextPageKey$.next('true');
          this.canLoadMoreMyProjects = true;
        } else {
          this.nextPageKey$.next('');
        }
        this.myProjectCards = this.myProjectCards.concat(myProjects);
        this.myProjectCardsLoaded = true;
      },
      _ => {
        this.canLoadMoreMyProjects = true;
        this.myProjectCardsLoaded = true;
      }
    );
  }

  applyFilter(filter: any, option: string) {
    this.totalFetchedCountMyProjects = 0;
    this.myProjectCardsLoaded = false;
    this.myProjectCards = [];
    let accepting;
    this.filterMyProjects = undefined;
    this.myProjectsStatus = '';

    if (option) {
      this.filterMyProjects = option;
      switch (option) {
        case ProjectCategoryStatus.Pending:
          this.myProjectsStatus = 'pending';
          break;
        case ProjectCategoryStatus.Accepted:
          this.myProjectsStatus = 'Published';
          accepting = true;
          break;
        case ProjectCategoryStatus.Closed:
          this.myProjectsStatus = 'Published';
          accepting = false;
          break;
        case ProjectCategoryStatus.Declined:
          this.myProjectsStatus = 'Rejected';
          break;
      }
    }

    this.paginate(
      PRIVATE_PROJECT_PAGINATE_ENDPOINT,
      this.totalFetchedCountMyProjects,
      DEFAULT_PAGE_SIZE,
      PROJECT_DEFAULT_SORT_NAME,
      ORDER_BY_ASCENDING,
      this.myProjectsStatus,
      '',
      accepting
    );
  }

  onSearchEnter(value: any) {
    this.searchMyProjects = value;
    this.totalFetchedCountMyProjects = 0;
    this.myProjectCardsLoaded = false;
    this.myProjectCards = [];

    const accepting =
      this.filterMyProjects === ProjectCategoryStatus.Accepted
        ? true
        : this.filterMyProjects === ProjectCategoryStatus.Closed
        ? false
        : '';
    this.paginate(
      PRIVATE_PROJECT_PAGINATE_ENDPOINT,
      this.totalFetchedCountMyProjects,
      DEFAULT_PAGE_SIZE,
      PROJECT_DEFAULT_SORT_NAME,
      ORDER_BY_ASCENDING,
      this.myProjectsStatus,
      this.searchMyProjects,
      accepting ? accepting : undefined
    );
  }
}
