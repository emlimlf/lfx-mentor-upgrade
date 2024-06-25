// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import hexRgb from 'hex-rgb';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectService } from '@app/services/project.service';
import { Project, ProjectCard } from '@app/models/project.model';
import { UserService } from '@app/services/user.service';
import { MentorUser, Profile, MenteeUser, ApprenticeCard, MenteeResponse } from '@app/models/user.model';
import { EmployerService } from '@app/services/employer.service';
import { Employer } from '@app/models/employer.model';
import { EmployerCard } from '@app/models/employer.model';
import { MentorResponse, MentorCard } from '@app/models/user.model';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MenteeService } from '@app/services/mentee.service';
import { PaginationService } from '@app/services/pagination.service';
import {
  DEFAULT_ORDER_BY,
  DEFAULT_PAGE_SIZE,
  MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
  ORDER_BY_ASCENDING,
  PROJECT_DEFAULT_SORT_UPDATED_STAMP,
} from '@app/core/constants';
import { AuthService } from '@app/services/auth.service';

type PageState =
  | 'featured'
  | 'projects'
  | 'mentors'
  | 'mentees'
  | 'employers'
  | 'my-mentorships'
  | 'my-tasks'
  | 'my-account';
type ProjectState = 'all' | 'accepting' | 'in-progress' | 'closed';

// Project endpoints
const PROJECT_PAGINATE_ENDPOINT = `${environment.API_URL}projects/cache/paginate`;
const PROJECT_SEARCH_ENDPOINT = `${environment.API_URL}projects/search`;

// Mentor endpoints
const MENTOR_PAGINATE_ENDPOINT = `${environment.API_URL}mentors/paginate`;
const MENTOR_SEARCH_ENDPOINT = `${environment.API_URL}mentors/search`;

// Mentee endpoints
const MENTEE_PAGINATE_ENDPOINT = `${environment.API_URL}mentees/paginate`;
const MENTEE_SEARCH_ENDPOINT = `${environment.API_URL}mentees/search`;

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private employerService: EmployerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private menteeService: MenteeService,
    private httpClient: HttpClient,
    public auth: AuthService,
    private pagination: PaginationService
  ) {}

  currentPageState: PageState = 'projects';
  projectSubTab: ProjectState = 'all';

  // Project list page

  // All projects (all applications)
  allProjects$ = new BehaviorSubject<Project[]>([]);
  allNextPageKey$ = new BehaviorSubject<string>('');
  visibleAllProjectCards$ = new BehaviorSubject<ProjectCard[]>([]);
  allShouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  allProjectCardsLoaded = false;
  private totalFetchedCountAllProjects = 0;

  // Accepting projects (accepting applications)
  acceptingProjects$ = new BehaviorSubject<Project[]>([]);
  acceptingNextPageKey$ = new BehaviorSubject<string>('');
  visibleAcceptingProjectCards$ = new BehaviorSubject<ProjectCard[]>([]);
  acceptingShouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  acceptingProjectCardsLoaded = false;
  private totalFetchedCountAcceptingProjects = 0;

  // In-progress projects (not accepting applications but term is active)
  inProgressProjects$ = new BehaviorSubject<Project[]>([]);
  inProgressNextPageKey$ = new BehaviorSubject<string>('');
  visibleInProgressProjectCards$ = new BehaviorSubject<ProjectCard[]>([]);
  inProgressShouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  inProgressProjectCardsLoaded = false;
  private totalFetchedCountInProgressProjects = 0;

  // Closed projects (term ended)
  closedProjects$ = new BehaviorSubject<Project[]>([]);
  closedNextPageKey$ = new BehaviorSubject<string>('');
  visibleClosedProjectCards$ = new BehaviorSubject<ProjectCard[]>([]);
  closedShouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  closedProjectCardsLoaded = false;
  private totalFetchedCountClosedProjects = 0;

  // Mentors
  mentors$ = new BehaviorSubject<MentorUser[]>([]);
  mentorPageOffset$ = new BehaviorSubject<number>(1);
  featuredMentorCardsLoaded = false;
  visibleMentorCards$ = new BehaviorSubject<MentorCard[]>([]);
  shouldShowNextMentorButton$ = new BehaviorSubject<boolean>(false);
  mentorsNextPageKey$ = new BehaviorSubject<string>('');
  private totalFetchedCountMentors = 0;

  // Mentees
  mentees$ = new BehaviorSubject<MenteeUser[]>([]);
  menteePageOffset$ = new BehaviorSubject<number>(1);
  featuredMenteeCardsLoaded = false;
  visibleMenteeCards$ = new BehaviorSubject<ApprenticeCard[]>([]);
  shouldShowNextMenteeButton$ = new BehaviorSubject<boolean>(false);
  menteesNextPageKey$ = new BehaviorSubject<string>('');
  private totalFetchedCountMentees = 0;

  // Employers
  employers$ = new BehaviorSubject<Employer[]>([]);
  employerPageOffset$ = new BehaviorSubject<number>(1);
  featuredEmployerCards: EmployerCard[] = [];
  featuredEmployerCardsLoaded = false;
  visibleEmployerCards$ = new BehaviorSubject<EmployerCard[]>([]);
  shouldShowNextEmployerButton$ = new BehaviorSubject<boolean>(false);
  employersNextPageKey$ = new BehaviorSubject<string>('');

  distinctProjects: Project[] = [];

  projectSearchText: string | undefined = undefined;
  mentorSearchText: string | undefined = undefined;
  menteeSearchText: string | undefined = undefined;
  employerSearchText: string | undefined = undefined;

  activeId = 'projects-tab';
  radioGroupForm!: FormGroup;
  radioControl?: AbstractControl;
  isLoggedIn = false;
  canLoadMoreProjects = true;
  preloadedMentees = true;
  canLoadMoreMentors = true;
  canLoadMoreMentees = true;
  unsubscribeRoute = new Subscription();
  showJumpToTopIcon = false;

  ngOnInit() {
    // Accepting projects section and featured projects section
    this.projectsAcceptingApplications();

    // In-progress projects section
    this.projectsNotAcceptingApplicationsAndTermIsOpen();

    // Closed projects section
    this.projectsWithClosedTerms();

    // All mentors section and featured mentors section
    this.featuredAndAllMentors();

    // All mentees section and featured mentees section
    this.featuredAndAllMentees();

    // Commented this since we do not show companies on the UI and so to avoid the API call.
    // All companies section and featured companies section
    // this.featuredAndAllCompanies();

    this.mentorshipSubTabsFormControl();

    const fragment = this.activatedRoute.snapshot.fragment;
    if (!fragment) {
      this.router.navigate(['/'], { fragment: 'projects' });
    }
  }

  ngAfterViewInit() {
    // Fragment conditions
    setTimeout(() => {
      this.fragmentChecks();
    });
  }

  @HostListener('window:scroll') // for window scroll events
  onScroll() {
    this.showJumpToTopIcon = window.scrollY > 180;
    let discoveryTabs = document.getElementsByClassName('discoveryTabs')[0] as HTMLElement;
    let searchSection = document.getElementsByClassName('search-section')[0] as HTMLElement;
    let supporterWallCollapse = document.getElementById('supporter-wall-container') as HTMLElement;
    this.addRemoveHeaderSticky(discoveryTabs, supporterWallCollapse.clientHeight, 'sticky');
    this.addRemoveHeaderSticky(searchSection, supporterWallCollapse.clientHeight, 'search-sticky');
  }

  private addRemoveHeaderSticky(element: HTMLElement, limit: number, className: string) {
    if (!element) {
      return;
    }
    if (window.pageYOffset > limit) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  onClickProjectNext(projectTab: string) {
    if (this.canLoadMoreProjects) {
      if (projectTab === 'all' && this.projectSubTab === projectTab) {
        const pageKey = this.allNextPageKey$.getValue();
        if (!pageKey) {
          return;
        }

        this.totalFetchedCountAllProjects += DEFAULT_PAGE_SIZE;
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'all', this.totalFetchedCountAllProjects);
      } else if (projectTab === 'accepting' && this.projectSubTab === projectTab) {
        const pageKey = this.acceptingNextPageKey$.getValue();
        if (!pageKey) {
          return;
        }

        this.totalFetchedCountAcceptingProjects += DEFAULT_PAGE_SIZE;
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'accepting', this.totalFetchedCountAcceptingProjects);
      } else if (projectTab === 'in-progress' && this.projectSubTab === projectTab) {
        const pageKey = this.inProgressNextPageKey$.getValue();
        if (!pageKey) {
          return;
        }

        this.totalFetchedCountInProgressProjects += DEFAULT_PAGE_SIZE;
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'in-progress', this.totalFetchedCountInProgressProjects);
      } else if (projectTab === 'closed' && this.projectSubTab === projectTab) {
        const pageKey = this.closedNextPageKey$.getValue();
        if (!pageKey) {
          return;
        }

        this.totalFetchedCountClosedProjects += DEFAULT_PAGE_SIZE;
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'closed', this.totalFetchedCountClosedProjects);
      }
    }
  }

  onClickProjectCardMentors(projectCard: ProjectCard) {
    if (projectCard.mentors && projectCard.mentors.length > 0) {
      projectCard.subcardShown = 'mentors';
    }
  }

  onClickProjectCardFunding(projectCard: ProjectCard) {
    const funding = projectCard.amountRaised;
    if (funding) {
      projectCard.subcardShown = 'funding';
    }
  }

  onClickMoreProjects(mentorCard: MentorCard) {
    if (mentorCard.projects && mentorCard.projects.length > 0) {
      mentorCard.subcardShown = 'projects';
    }
  }

  onClickMentorNext() {
    if (this.canLoadMoreMentors) {
      const pageKey = this.mentorsNextPageKey$.getValue();
      if (!pageKey) {
        return;
      }

      this.totalFetchedCountMentors += DEFAULT_PAGE_SIZE;
      this.paginate(
        MENTOR_PAGINATE_ENDPOINT,
        'mentors',
        this.totalFetchedCountMentors,
        DEFAULT_PAGE_SIZE,
        MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
        ORDER_BY_ASCENDING
      );
    }
  }

  onClickMenteeNext() {
    if (this.canLoadMoreMentees) {
      const pageKey = this.menteesNextPageKey$.getValue();
      if (!pageKey) {
        return;
      }

      this.totalFetchedCountMentees += DEFAULT_PAGE_SIZE;
      this.paginate(
        MENTEE_PAGINATE_ENDPOINT,
        'mentees',
        this.totalFetchedCountMentees,
        DEFAULT_PAGE_SIZE,
        MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
        ORDER_BY_ASCENDING
      );
    }
  }

  // onClickEmployerNext() {
  //   const pageKey = this.employersNextPageKey$.getValue();
  //   if (!pageKey) {
  //     return;
  //   }
  //   // Load next page and set next page key
  //   this.getEmployers('5', pageKey, undefined, 'approved', this.employerSearchText).subscribe(
  //     (response: EmployerResponse) => {
  //       const { employers, nextPageKey } = response;
  //       const currentEmployers = this.employers$.getValue();
  //       this.employers$.next(currentEmployers.concat(employers));
  //       this.employersNextPageKey$.next(nextPageKey);
  //     }
  //   );
  // }

  onClickChangePageState(tab: PageState) {
    this.currentPageState = tab;
    this.clearSearchState(tab);
    this.router.navigate([''], { fragment: tab });
  }

  clearSearchState(tab: PageState) {
    switch (tab) {
      case 'projects':
        this.clearMentorSearchState();
        this.clearMenteeSearchState();
        this.clearCompanySearchState();
        break;
      case 'mentors':
        this.clearProjectSearchState();
        this.clearMenteeSearchState();
        this.clearCompanySearchState();
        break;
      case 'mentees':
        this.clearProjectSearchState();
        this.clearMentorSearchState();
        this.clearCompanySearchState();
        break;
      case 'employers':
        this.clearProjectSearchState();
        this.clearMentorSearchState();
        this.clearMenteeSearchState();
        break;
    }
  }

  goToPage(pageName: string) {
    this.router.navigate([pageName]);
  }

  goToFundingURL() {
    window.location.href = environment.FUNDSPRING_URL;
  }

  onTabChange(event: NgbTabChangeEvent) {
    if (event.activeId !== event.nextId) {
      switch (event.nextId) {
        case 'projects-tab':
          this.onClickChangePageState('projects');
          this.radioGroupForm.controls['model'].patchValue('all');
          break;
        case 'mentors-tab':
          this.onClickChangePageState('mentors');
          break;
        case 'mentees-tab':
          this.onClickChangePageState('mentees');
          break;
        case 'my-mentorships-tab':
          this.onClickChangePageState('my-mentorships');
          break;
        case 'my-tasks-tab':
          this.onClickChangePageState('my-tasks');
          break;
        case 'my-account-tab':
          this.onClickChangePageState('my-account');
          break;
        default:
          this.onClickChangePageState('featured');
          break;
      }
    }
  }

  onProjectSearchEnter(filterText: string) {
    this.projectSearchText = filterText !== '' ? filterText : undefined;

    if (this.projectSubTab === 'all') {
      this.allProjectCardsLoaded = false;
      this.totalFetchedCountAllProjects = 0;
      this.allProjects$.next([]);
      if (!this.projectSearchText) {
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'all');
      } else {
        this.preloadedMentees = false;
        this.pagination.getSearchResults(PROJECT_SEARCH_ENDPOINT, false, this.projectSearchText).subscribe(
          (response: any) => {
            const allSearchedProjects: Project[] = [];
            let { hits } = response;
            if (!hits) {
              hits = [];
            }

            hits.forEach((item: any) => {
              allSearchedProjects.push(item._source);
            });

            this.allProjects$.next(allSearchedProjects || []);
            this.allNextPageKey$.next('');
            this.allProjectCardsLoaded = true;
          },
          _ => {
            this.allProjectCardsLoaded = true;
          }
        );
      }
    } else if (this.projectSubTab === 'accepting') {
      this.acceptingProjectCardsLoaded = false;
      this.totalFetchedCountAcceptingProjects = 0;
      this.acceptingProjects$.next([]);
      if (!this.projectSearchText) {
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'accepting');
      } else {
        this.preloadedMentees = false;

        this.pagination
          .getSearchResults(PROJECT_SEARCH_ENDPOINT, false, this.projectSearchText, 'open', true)
          .subscribe(
            (response: any) => {
              const acceptingProjects: Project[] = [];
              let { hits } = response;
              if (!hits) {
                hits = [];
              }

              hits.forEach((item: any) => {
                acceptingProjects.push(item._source);
              });
              this.acceptingProjects$.next(acceptingProjects || []);
              this.acceptingNextPageKey$.next('');
              this.acceptingProjectCardsLoaded = true;
            },
            _ => {
              this.acceptingProjectCardsLoaded = true;
            }
          );
      }
    } else if (this.projectSubTab === 'in-progress') {
      this.inProgressProjectCardsLoaded = false;
      this.totalFetchedCountInProgressProjects = 0;
      this.inProgressProjects$.next([]);
      if (!this.projectSearchText) {
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'in-progress');
      } else {
        this.preloadedMentees = false;

        this.pagination
          .getSearchResults(PROJECT_SEARCH_ENDPOINT, false, this.projectSearchText, 'open', false)
          .subscribe(
            (response: any) => {
              const inProgressProjects: Project[] = [];
              let { hits } = response;
              if (!hits) {
                hits = [];
              }

              hits.forEach((item: any) => {
                inProgressProjects.push(item._source);
              });

              this.inProgressProjects$.next(inProgressProjects || []);
              this.inProgressNextPageKey$.next('');
              this.inProgressProjectCardsLoaded = true;
            },
            _ => {
              this.inProgressProjectCardsLoaded = true;
            }
          );
      }
    } else if (this.projectSubTab === 'closed') {
      this.closedProjectCardsLoaded = false;
      this.totalFetchedCountClosedProjects = 0;
      this.closedProjects$.next([]);
      if (!this.projectSearchText) {
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'closed');
      } else {
        this.preloadedMentees = false;

        this.pagination
          .getSearchResults(PROJECT_SEARCH_ENDPOINT, false, this.projectSearchText, 'closed', false)
          .subscribe(
            (response: any) => {
              const closedProjects: Project[] = [];
              let { hits } = response;
              if (!hits) {
                hits = [];
              }

              hits.forEach((item: any) => {
                closedProjects.push(item._source);
              });

              this.closedProjects$.next(closedProjects || []);
              this.closedNextPageKey$.next('');
              this.closedProjectCardsLoaded = true;
            },
            _ => {
              this.closedProjectCardsLoaded = true;
            }
          );
      }
    }
  }

  onMentorSearchEnter(filterText: string) {
    this.mentorSearchText = filterText !== '' ? filterText : undefined;

    this.featuredMentorCardsLoaded = false;
    if (!this.mentorSearchText) {
      this.totalFetchedCountMentors = 0;
      this.mentors$.next([]);
      this.paginate(
        MENTOR_PAGINATE_ENDPOINT,
        'mentors',
        this.totalFetchedCountMentors,
        DEFAULT_PAGE_SIZE,
        MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
        ORDER_BY_ASCENDING
      );
    } else {
      this.pagination.getSearchResults(MENTOR_SEARCH_ENDPOINT, false, this.mentorSearchText).subscribe(
        (response: any) => {
          const filteredMentors: MentorUser[] = [];
          let { hits } = response;
          if (!hits) {
            hits = [];
          }

          hits.forEach((item: any) => {
            filteredMentors.push(item._source);
          });

          this.mentors$.next(filteredMentors || []);
          this.mentorsNextPageKey$.next('');
          this.featuredMentorCardsLoaded = true;
        },
        _ => {
          this.featuredMentorCardsLoaded = true;
        }
      );
    }
  }

  onMenteeSearchEnter(filterText: string) {
    this.menteeSearchText = filterText !== '' ? filterText : undefined;

    this.featuredMenteeCardsLoaded = false;
    if (!this.menteeSearchText) {
      this.totalFetchedCountMentees = 0;
      this.mentees$.next([]);
      this.paginate(
        MENTEE_PAGINATE_ENDPOINT,
        'mentees',
        this.totalFetchedCountMentees,
        DEFAULT_PAGE_SIZE,
        MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
        ORDER_BY_ASCENDING
      );
    } else {
      this.pagination.getSearchResults(MENTEE_SEARCH_ENDPOINT, false, this.menteeSearchText).subscribe(
        (response: any) => {
          const filteredMentees: MenteeUser[] = [];
          let { hits } = response;
          if (!hits) {
            hits = [];
          }

          hits.forEach((item: any) => {
            filteredMentees.push(item._source);
          });

          this.mentees$.next(filteredMentees || []);
          this.menteesNextPageKey$.next('');
          this.featuredMenteeCardsLoaded = true;
        },
        _ => {
          this.featuredMenteeCardsLoaded = true;
        }
      );
    }
  }

  // onCompanySearchEnter(filterText: string) {
  //   this.employerSearchText = filterText !== '' ? filterText : undefined;
  //   this.getEmployers('5', undefined, undefined, 'approved', this.employerSearchText).subscribe(
  //     (response: EmployerResponse) => {
  //       const { employers, nextPageKey } = response;
  //       this.employers$.next(employers || []);
  //       this.employersNextPageKey$.next(nextPageKey);
  //     }
  //   );
  // }

  private AllProjects() {
    if (this.currentPageState === 'projects' && this.projectSubTab === 'all') {
      this.paginate(PROJECT_PAGINATE_ENDPOINT, 'all');
    }
    const allProjectCards$ = this.allProjects$.pipe(
      map(projects =>
        projects
          .filter(project => !!project)
          .map(project => {
            return this.convertProjectIntoProjectCard(project);
          })
      )
    );

    // Project Cards on the project list
    allProjectCards$.subscribe(this.visibleAllProjectCards$);
    this.allNextPageKey$.pipe(map(key => !!key)).subscribe(this.allShouldShowNextButton$);
  }

  private projectsAcceptingApplications() {
    if (this.currentPageState === 'projects' && this.projectSubTab === 'accepting') {
      this.paginate(PROJECT_PAGINATE_ENDPOINT, 'accepting');
    }
    const acceptingProjectCards$ = this.acceptingProjects$.pipe(
      map(projects => {
        this.distinctProjects = [];
        projects.forEach(p => {
          if (
            !this.distinctProjects.some(
              x => x.projectId === p.projectId && x.name.toLowerCase() === p.name.toLowerCase()
            )
          ) {
            this.distinctProjects.push(p);
          }
        });
        return this.distinctProjects
          .filter(project => !!project)
          .map(project => {
            return this.convertProjectIntoProjectCard(project);
          });
      })
    );

    // Project Cards on the project list
    acceptingProjectCards$.subscribe(this.visibleAcceptingProjectCards$);
    this.acceptingNextPageKey$.pipe(map(key => !!key)).subscribe(this.acceptingShouldShowNextButton$);
  }

  private projectsNotAcceptingApplicationsAndTermIsOpen() {
    if (this.currentPageState === 'projects' && this.projectSubTab === 'in-progress') {
      this.paginate(PROJECT_PAGINATE_ENDPOINT, 'in-progress');
    }
    const inProgressProjectCards$ = this.inProgressProjects$.pipe(
      map(projects =>
        projects
          .filter(project => !!project)
          .map(project => {
            return this.convertProjectIntoProjectCard(project);
          })
      )
    );

    // In-progress Project Cards on the project list
    inProgressProjectCards$.subscribe(this.visibleInProgressProjectCards$);
    this.inProgressNextPageKey$.pipe(map(key => !!key)).subscribe(this.inProgressShouldShowNextButton$);
  }

  private projectsWithClosedTerms() {
    if (this.currentPageState === 'projects' && this.projectSubTab === 'closed') {
      this.paginate(PROJECT_PAGINATE_ENDPOINT, 'closed');
    }
    const closedProjectCards$ = this.closedProjects$.pipe(
      map(projects =>
        projects
          .filter(project => !!project)
          .map(project => {
            return this.convertProjectIntoProjectCard(project);
          })
      )
    );

    // Project Cards on the project list
    closedProjectCards$.subscribe(this.visibleClosedProjectCards$);
    this.closedNextPageKey$.pipe(map(key => !!key)).subscribe(this.closedShouldShowNextButton$);
  }

  private fragmentChecks() {
    this.unsubscribeRoute = this.activatedRoute.fragment.subscribe((fragment: string) => {
      fragment ? (this.currentPageState = fragment as PageState) : (this.currentPageState = 'projects');
      if (fragment && fragment.includes('projects_')) {
        this.currentPageState = fragment.split('_')[0] as PageState;
        this.projectSubTab = fragment.split('_')[1] as ProjectState;
      } else {
        this.currentPageState = fragment as PageState;
      }

      switch (fragment) {
        case 'my-mentorships':
        case 'my-tasks':
        case 'my-account':
          if (!this.auth.loggedIn) {
            fragment = 'projects';
            this.currentPageState = 'projects';
          }
          break;
      }

      this.activeId = this.currentPageState + '-tab';

      if (fragment === 'projects') {
        this.radioGroupForm.controls['model'].patchValue('all');
      } else if (fragment.includes('projects_')) {
        this.radioGroupForm.controls['model'].patchValue(this.projectSubTab);
        this.handleTabSwitchAPICall();
      }
    });
  }

  private handleTabSwitchAPICall() {
    switch (this.projectSubTab) {
      case 'in-progress':
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'in-progress');
        break;
      case 'closed':
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'closed');
        break;
      case 'accepting':
        this.paginate(PROJECT_PAGINATE_ENDPOINT, 'accepting');
        break;
      case 'all':
        this.AllProjects();
        // this.canLoadMoreProjects = true;
        // this.getAllProjects();
        break;
    }
  }

  private featuredAndAllMentors() {
    // Mentor Cards
    const mentorCards$ = this.mentors$.pipe(
      map(mentors => mentors.map(mentor => this.convertMentorUserIntoMentorCard(mentor)))
    );

    // Visible Mentor Cards (Mentors list)
    mentorCards$.subscribe(this.visibleMentorCards$);
    // Visibility of the next button on mentors list
    this.mentorsNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextMentorButton$);

    this.paginate(
      MENTOR_PAGINATE_ENDPOINT,
      'mentors',
      0,
      DEFAULT_PAGE_SIZE,
      MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
      ORDER_BY_ASCENDING
    );
  }

  private featuredAndAllMentees() {
    // Mentee Cards
    const menteeCards$ = this.mentees$.pipe(
      map(mentees => mentees.map(mentee => this.convertMenteeUserIntoMenteeCard(mentee)))
    );

    // Visible Mentee Cards (Mentees list)
    menteeCards$.subscribe(this.visibleMenteeCards$);
    // Visibility of the next button on mentees list
    this.menteesNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextMenteeButton$);

    this.paginate(
      MENTEE_PAGINATE_ENDPOINT,
      'mentees',
      0,
      DEFAULT_PAGE_SIZE,
      MENTOR_MENTEE_DEFAULT_SORT_SLUG_KEYWORD,
      ORDER_BY_ASCENDING
    );
  }

  // private featuredAndAllCompanies() {
  //   // Employer Cards
  //   const employerCards$ = this.employers$.pipe(
  //     map(employers => {
  //       return employers.map(employer => this.convertEmployerIntoEmployerCard(employer));
  //     })
  //   );
  //   // Featured Employer Cards
  //   employerCards$.pipe(map(employerCards => employerCards.slice(0, 5))).subscribe(cards => {
  //     this.featuredEmployerCards = cards;
  //   });
  //   // Visible Employer Cards (Employer list)
  //   employerCards$.subscribe(this.visibleEmployerCards$);

  //   // Visibility of the next button on employers list
  //   this.employersNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextEmployerButton$);
  //   // Load Employers
  //   this.getEmployers('25', undefined, undefined, 'approved').subscribe(
  //     response => {
  //       const currentEmployers = this.employers$.getValue();
  //       const accumulatedEmployers = currentEmployers.concat(response.employers);
  //       this.employers$.next(accumulatedEmployers);
  //       this.employersNextPageKey$.next(response.nextPageKey);
  //       this.featuredEmployerCardsLoaded = true;
  //     },
  //     () => (this.featuredEmployerCardsLoaded = true),
  //     () => (this.featuredEmployerCardsLoaded = true)
  //   );
  // }

  private mentorshipSubTabsFormControl() {
    this.radioGroupForm = this.formBuilder.group({
      model: 'all',
    });

    this.radioControl = this.radioGroupForm.controls['model'];
    this.radioControl.valueChanges.subscribe(value => {
      this.router.navigate([''], { fragment: `projects_${value}` });
      this.allProjects$.next([]);
      this.acceptingProjects$.next([]);
      this.inProgressProjects$.next([]);
      this.closedProjects$.next([]);
      this.projectSubTab = value;

      this.totalFetchedCountAllProjects = 0;
      this.totalFetchedCountAcceptingProjects = 0;
      this.totalFetchedCountInProgressProjects = 0;
      this.totalFetchedCountClosedProjects = 0;
    });
  }

  private getProjectCardColor(project: Project): string {
    if (!project.color) {
      return 'rgb(128, 128, 128)';
    }
    const { red, green, blue } = hexRgb(project.color);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  private convertEmployerIntoEmployerCard(employer: Employer): EmployerCard {
    const fundingOpportunities = employer.interviewOpportunities.fundingOpportunities;
    const hiringOpportunities = employer.interviewOpportunities.hiringOpportunities;
    return {
      topHeaderStyle: {
        fill: 'rgb(40,170,76)', // TODO Where to get?
      },
      logoUrl: employer.logoUrl,
      title: employer.companyName,
      description: employer.description,
      totalFunding:
        fundingOpportunities && fundingOpportunities.amount >= 0
          ? '$' + this.numberWithCommas(fundingOpportunities.amount)
          : '',
      opportunities: hiringOpportunities ? hiringOpportunities.interviews : 0,
      participation:
        hiringOpportunities && hiringOpportunities.HiringOpportunitiesProjectDetails
          ? hiringOpportunities.HiringOpportunitiesProjectDetails
          : [], // TODO Where to get?
      status: employer.status,
    };
  }

  private convertMentorUserIntoMentorCard(mentorUser: MentorUser): MentorCard {
    const mentorProfile = mentorUser.profiles.find(profile => {
      return profile.type === 'mentor';
    }) as Profile;
    const firstName = mentorProfile.firstName;
    const lastName = mentorProfile.lastName;
    const skillTags = mentorProfile.skillSet && mentorProfile.skillSet.skills;
    const projects = mentorProfile.projects || [];

    return {
      id: mentorUser.id,
      topHeaderStyle: {
        fill: '#023465',
      },
      avatarUrl: mentorProfile.logoUrl || mentorUser.avatarUrl || '',
      title: `${firstName} ${lastName}`,
      description: mentorProfile.introduction || '',
      skillTags: skillTags || [],
      graduates: mentorUser.graduates || [], // Where to get?
      projects,
      apprentices: mentorUser.mentees || [],
      subcardShown: null,
    };
  }

  private convertMenteeUserIntoMenteeCard(menteeUser: MenteeUser): ApprenticeCard {
    const projects: any[] = [];
    const mentors: any[] = [];

    if (menteeUser.projects && menteeUser.projects.length > 0) {
      let latestStatusRecord: any;
      // Show first project for which mentee was accepted.
      const acceptedProjects = menteeUser.status.filter(s => s.status === 'accepted');
      if (acceptedProjects.length > 0) {
        latestStatusRecord = acceptedProjects.reduce((a, b) => (new Date(a.updatedAt) < new Date(b.updatedAt) ? a : b));
      }

      // If there is no project with accepted status and then show first project for which mentee was graduated.
      if (!latestStatusRecord) {
        const graduatedProjects = menteeUser.status.filter(s => s.status === 'graduated');
        if (graduatedProjects.length > 0) {
          latestStatusRecord = graduatedProjects.reduce((a, b) =>
            new Date(a.updatedAt) < new Date(b.updatedAt) ? a : b
          );
        }
      }

      if (latestStatusRecord) {
        const latestProject = menteeUser.projects.find((project: any) => project.id === latestStatusRecord.projectId);
        if (latestProject) {
          projects.push({
            name: latestProject.name,
            logoUrl: latestProject.logoUrl,
            menteeStatus: latestStatusRecord.status,
          });

          if (latestProject.mentors) {
            latestProject.mentors.forEach(mentor => {
              mentors.push({
                name: mentor.name,
                avatarUrl: mentor.avatarUrl,
              });
            });
          }
        }
      }
    }

    return {
      id: menteeUser.id,
      topHeaderStyle: {
        fill: '#023465',
      },
      fullName: menteeUser.name,
      avatarUrl: menteeUser.avatarUrl || '',
      introduction: menteeUser.introduction || '',
      currentSkills: menteeUser.skills || [],
      projects,
      mentors,
      desiredSkills: [],
    };
  }

  private convertProjectIntoProjectCard(project: Project): ProjectCard {
    const terms = project.programTerms;
    const rgbString = this.getProjectCardColor(project);
    const mentors = project.apprenticeNeeds.mentors ? project.apprenticeNeeds.mentors : [];
    const opportunities = project.opportunities ? project.opportunities : [];

    return {
      projectId: project.projectId,
      subcardShown: null,
      topHeaderStyle: {
        fill: rgbString,
      },
      acceptApplications: project.acceptApplications,
      logoUrl: project.logoUrl,
      tags: project.apprenticeNeeds.skills,
      title: project.name,
      description: project.description,
      terms,
      opportunities,
      mentors,
      fundspringProjectId: project.fundspringProjectId,
      slug: project.slug,
      amountRaised: project.amountRaised || 0,
      projectCIIProjectId: project.projectCIIProjectId,
      apprenticeNeeds: project.apprenticeNeeds,
      ciiMarkup: project.ciiMarkup,
    };
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // private getEmployers(
  //   limit?: string,
  //   nextPageKey?: string,
  //   userId?: string,
  //   status?: string,
  //   filter?: string
  // ): Observable<EmployerResponse> {
  //   return this.employerService.getEmployers(limit, nextPageKey, userId, status, filter);
  // }

  private clearProjectSearchState() {
    this.projectSearchText = '';
    this.onProjectSearchEnter('');
  }

  private clearMentorSearchState() {
    this.mentorSearchText = '';
    this.onMentorSearchEnter('');
  }

  private clearMenteeSearchState() {
    this.menteeSearchText = '';
    this.onMenteeSearchEnter('');
  }

  private clearCompanySearchState() {
    this.employerSearchText = '';
    // Commented this since we do not show companies on the UI and so to avoid the API call.
    // this.onCompanySearchEnter('');
  }

  // TODO: Things used to track the state can be removed once the elastic search endpoints are integrated.
  private paginate(
    endpoint: string,
    state: PageState | ProjectState,
    from: number = 0,
    size: number = DEFAULT_PAGE_SIZE,
    sortBy: string = PROJECT_DEFAULT_SORT_UPDATED_STAMP,
    orderBy: string = DEFAULT_ORDER_BY
  ) {
    this.preloadedMentees = true;
    this.canLoadMoreProjects = false;
    const allProjects: Project[] = [];
    const acceptingProjects: Project[] = [];
    const inProgressProjects: Project[] = [];
    const closedProjects: Project[] = [];

    const allMentors: MentorUser[] = [];

    const allMentees: MenteeUser[] = [];

    let extraParams = new HttpParams();
    switch (state) {
      case 'all':
        // No extra parameters required.
        this.allProjectCardsLoaded = false;
        break;
      case 'accepting':
        extraParams = extraParams.set('status', 'open');
        extraParams = extraParams.set('accepting', 'true');
        this.acceptingProjectCardsLoaded = false;
        break;
      case 'in-progress':
        extraParams = extraParams.set('status', 'open');
        extraParams = extraParams.set('accepting', 'false');
        this.inProgressProjectCardsLoaded = false;
        break;
      case 'closed':
        extraParams = extraParams.set('status', 'closed');
        this.closedProjectCardsLoaded = false;
        break;
      case 'mentors':
        // No extra parameters required.
        this.canLoadMoreMentors = false;
        this.featuredMentorCardsLoaded = false;
        break;
      case 'mentees':
        // No extra parameters required.
        this.canLoadMoreMentees = false;
        this.featuredMenteeCardsLoaded = false;
        break;
    }

    this.pagination.getPage(endpoint, extraParams, from, size, sortBy, orderBy).subscribe(
      (data: any) => {
        if (!data) {
          return;
        }
        const { hits, total } = data;

        hits.forEach((item: any) => {
          switch (state) {
            case 'all':
              allProjects.push(item._source);
              break;
            case 'accepting':
              let exist = acceptingProjects.some(
                p => p.projectId === item._source.projectId && p.name === item._source.name
              );
              if (!exist) {
                acceptingProjects.push(item._source);
              }
              break;
            case 'in-progress':
              inProgressProjects.push(item._source);
              break;
            case 'closed':
              closedProjects.push(item._source);
              break;
            case 'mentors':
              allMentors.push(item._source);
              break;
            case 'mentees':
              allMentees.push(item._source);
              break;
          }
        });

        switch (state) {
          case 'all':
            if (this.totalFetchedCountAllProjects + DEFAULT_PAGE_SIZE < total.value) {
              this.allNextPageKey$.next('true');
              this.canLoadMoreProjects = true;
            } else {
              this.allNextPageKey$.next('');
            }
            this.allProjects$.next(this.allProjects$.getValue().concat(allProjects));
            this.allProjectCardsLoaded = true;
            break;
          case 'accepting':
            if (this.totalFetchedCountAcceptingProjects + DEFAULT_PAGE_SIZE < total.value) {
              this.acceptingNextPageKey$.next('true');
              this.canLoadMoreProjects = true;
            } else {
              this.acceptingNextPageKey$.next('');
            }
            const mergedProjects = this.mergeProjects(this.acceptingProjects$.getValue(), acceptingProjects);
            this.acceptingProjects$.next(mergedProjects);
            this.acceptingProjectCardsLoaded = true;
            break;
          case 'in-progress':
            if (this.totalFetchedCountInProgressProjects + DEFAULT_PAGE_SIZE < total.value) {
              this.inProgressNextPageKey$.next('true');
              this.canLoadMoreProjects = true;
            } else {
              this.inProgressNextPageKey$.next('');
            }
            this.inProgressProjects$.next(this.inProgressProjects$.getValue().concat(inProgressProjects));
            this.inProgressProjectCardsLoaded = true;
            break;
          case 'closed':
            if (this.totalFetchedCountClosedProjects + DEFAULT_PAGE_SIZE < total.value) {
              this.closedNextPageKey$.next('true');
              this.canLoadMoreProjects = true;
            } else {
              this.closedNextPageKey$.next('');
            }
            this.closedProjects$.next(this.closedProjects$.getValue().concat(closedProjects));
            this.closedProjectCardsLoaded = true;
            break;
          case 'mentors':
            if (this.totalFetchedCountMentors + DEFAULT_PAGE_SIZE < total.value) {
              this.mentorsNextPageKey$.next('true');
              this.canLoadMoreMentors = true;
            } else {
              this.mentorsNextPageKey$.next('');
            }
            this.mentors$.next(this.mentors$.getValue().concat(allMentors));
            this.featuredMentorCardsLoaded = true;
            break;
          case 'mentees':
            if (this.totalFetchedCountMentees + DEFAULT_PAGE_SIZE < total.value) {
              this.menteesNextPageKey$.next('true');
              this.canLoadMoreMentees = true;
            } else {
              this.menteesNextPageKey$.next('');
            }
            this.mentees$.next(this.mentees$.getValue().concat(allMentees));
            this.featuredMenteeCardsLoaded = true;
            break;
        }
      },
      _ => {
        this.canLoadMoreProjects = true;
        switch (state) {
          case 'all':
            this.allProjectCardsLoaded = true;
            break;
          case 'accepting':
            this.acceptingProjectCardsLoaded = true;
            break;
          case 'in-progress':
            this.inProgressProjectCardsLoaded = true;
            break;
          case 'closed':
            this.closedProjectCardsLoaded = true;
            break;
          case 'mentors':
            this.canLoadMoreMentors = true;
            this.featuredMentorCardsLoaded = true;
            break;
          case 'mentees':
            this.canLoadMoreMentees = true;
            this.featuredMenteeCardsLoaded = true;
            break;
        }
      }
    );
  }

  trackByFunc(index: number, item: any) {
    return item.projectId;
  }

  jumpTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canJumpTop() {
    switch (this.currentPageState) {
      case 'projects':
        switch (this.projectSubTab) {
          case 'all':
            return !(
              this.allProjectCardsLoaded &&
              this.visibleAllProjectCards$ &&
              this.visibleAllProjectCards$.value.length === 0
            );
          case 'accepting':
            return !(
              this.acceptingProjectCardsLoaded &&
              this.visibleAcceptingProjectCards$ &&
              this.visibleAcceptingProjectCards$.value.length === 0
            );
          case 'in-progress':
            return !(
              this.inProgressProjectCardsLoaded &&
              this.visibleInProgressProjectCards$ &&
              this.visibleInProgressProjectCards$.value.length === 0
            );
          case 'closed':
            return !(
              this.closedProjectCardsLoaded &&
              this.visibleClosedProjectCards$ &&
              this.visibleClosedProjectCards$.value.length === 0
            );
        }
        break;

      case 'mentors':
        return !(
          this.featuredMentorCardsLoaded &&
          this.visibleMentorCards$ &&
          this.visibleMentorCards$.value.length === 0
        );
      case 'mentees':
        return !(
          this.featuredMenteeCardsLoaded &&
          this.visibleMenteeCards$ &&
          this.visibleMenteeCards$.value.length === 0
        );
    }
  }

  mergeProjects(x: Project[], y: Project[]): Project[] {
    let z = x.concat(y);
    return z.filter((item, index) => {
      return z.indexOf(item) == index;
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeRoute) {
      this.unsubscribeRoute.unsubscribe();
    }
  }
}
