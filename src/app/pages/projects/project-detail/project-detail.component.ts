// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import {
  Project,
  Mentor,
  MentorResponse,
  Mentee,
  MenteeResponse,
  Opportunity,
  ProgramTerm,
} from '@app/models/project.model';
import { Employer, EmployerCard, Job } from '@app/models/employer.model';
import { ProjectService } from '@app/services/project.service';
import { AuthService } from '@app/services/auth.service';
import { environment } from '@app/../environments/environment';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { CODE_OF_CONDUCT } from '@app/core';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit, AfterViewInit {
  public showAlreadyMemberError = false;

  buttonApplyErrorMessage = '';
  projectId = '';
  needWideContainer = false;
  project$ = new Subject<Project>();
  mentorResponse$ = new Subject<MentorResponse>();
  projectMentee$ = new Subject<MenteeResponse>();
  project: any = {};
  projectFunding: any = {};
  projectMentors: Mentor[] = [];
  projectMentees: Mentee[] = [];
  projectOpportunities: Opportunity[] = [];
  projectLoaded = false;
  activeTerms: string[] = [];
  projectRoles: string[] = [];
  isProjectAdmin$ = new Subject<boolean>();
  public showApplyBtn = true;
  ciiBadgeColor = '';
  mTerms = '';
  num = 0;
  hideM = false;
  isPending = false;
  isRejected = false;
  userId: any = '';
  isScrolled = false;
  // Employers
  employers$ = new BehaviorSubject<Employer[]>([]);
  employerPageOffset$ = new BehaviorSubject<number>(1);
  featuredEmployerCards: EmployerCard[] = [];
  featuredEmployerCardsLoaded = false;
  visibleEmployerCards$ = new BehaviorSubject<EmployerCard[]>([]);
  shouldShowNextEmployerButton$ = new BehaviorSubject<boolean>(false);
  employersNextPageKey$ = new BehaviorSubject<string>('');
  employerIDToJobs$ = new BehaviorSubject<{ [employerID: string]: Job[] }>({});

  // Conditional variables
  applyBtnLabel = 'Apply';
  acceptApplications = true;
  userId$ = new Subject<string>();
  isMaintainer = false;
  isMentor = false;
  isAdmin = false;
  isMentee = true;
  rolesLoaded = false;
  @ViewChild('stickyMarker', { static: true }) stickyMarker!: ElementRef;
  readonly codeOfConductDefaultURL = CODE_OF_CONDUCT;
  isListOverflowed = false;
  @ViewChild('industryList', { static: true }) industryList!: ElementRef;
  sponsorsLimit = 3;
  @ViewChild('stickyTabBar', { static: true }) stickyTabBar!: any;
  activePopover: any;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.projectId = routeParams.id;
      this.projectService.getProject(this.projectId).subscribe(this.project$);
      this.projectService.getProjectMentees(this.projectId).subscribe(this.projectMentee$);
      this.project$.subscribe(results => {
        this.project = results;

        if (this.project.status === 'Rejected') {
          this.router.navigate(['/404']);
        }

        this.authService.isAuthenticated$.subscribe(loggedIn => {
          if (loggedIn) {
            this.projectService.getProjectUserRoles(this.projectId).subscribe(roles => {
              this.isMaintainer = roles.indexOf('maintainer') > -1;
              this.isMentor = roles.indexOf('mentor') > -1;
              this.isMentee = roles.indexOf('apprentice') > -1;
              this.isAdmin = this.isMaintainer || this.isMentor;
              this.isProjectAdmin$.next(this.isAdmin);
              this.rolesLoaded = true;

              // we know that the user is logged in, but if the user is already
              // involved in this project (i.e. as an Apprentice/Mentee, or as
              // a Mentor, or as the Owner), then we want to hide the Apply
              // button, _but_ if the applications are closed, we will still
              // allow the button to render as it will be disabled and say
              // "Applications Closed"
              if (roles.length > 0 && this.project.acceptApplications) {
                this.showApplyBtn = false;
              }
            });
          }
        });

        const programTerms: ProgramTerm[] = this.project.programTerms;
        if (programTerms) {
          programTerms.filter(term => {
            // const today = new Date();

            // const termStartDate = new Date(+term.startDateTime * 1000);
            // const termEndDate = new Date(+term.endDateTime * 1000);
            // if (today < termStartDate || today < termEndDate) {
            //   this.activeTerms.push(term.name);
            // }
            if (term.Active === 'open') {
              this.activeTerms.push(term.name);
            }
          });
        }

        this.isPending = this.project.status === 'pending';
        this.isRejected = this.project.status === 'Rejected';

        this.project.logoUrl = this.project.logoUrl ? this.project.logoUrl : '/assets/default-icon.svg';

        this.projectLoaded = true;

        this.projectOpportunities = this.project.opportunities || [];

        this.addLfAsSponsor();

        ((this.project.apprenticeNeeds.mentors as any[]) || []).forEach(mentor => {
          if (!mentor.logoUrl || (mentor.logoUrl as string).includes('s.gravatar')) {
            mentor.logoUrl = this.downloadService._defaultLogo({
              first: mentor.name,
              last: '',
            });
          }
        });
        this.projectMentors = this.project.apprenticeNeeds.mentors;
        (this.projectMentors || []).forEach(mentor => {
          if (!mentor.avatarUrl || (mentor.avatarUrl as string).includes('s.gravatar')) {
            mentor.avatarUrl = this.downloadService._defaultLogo({
              first: mentor.name,
              last: '',
            });
          }
        });

        // this.projectTerm(this.activeTerms);

        // Fill conditional variables
        if (this.project.acceptApplications === false) {
          this.showApplyBtn = true; // show the button is disabled, even to project maintainer/mentor/mentee
          this.acceptApplications = false;
          this.applyBtnLabel = 'Applications Closed';
        }
      });
      this.projectMentee$.subscribe(results => {
        this.projectMentees = results.mentees;
        this.projectMentees.forEach(mentee => {
          if ((mentee.avatarUrl && (mentee.avatarUrl as string).includes('s.gravatar')) || !mentee.avatarUrl) {
            mentee.avatarUrl = this.downloadService._defaultLogo({
              first: mentee.firstName,
              last: mentee.lastName,
            });
          }
        });
      });

      // Employer Cards
      const employerCards$ = combineLatest(this.employers$, this.employerIDToJobs$).pipe(
        map(([employers]) => {
          return employers.map(employer => this.convertEmployerIntoEmployerCard(employer));
        })
      );

      // Featured Employer Cards
      employerCards$.pipe(map(employerCards => employerCards.slice(0, 3))).subscribe(cards => {
        this.featuredEmployerCards = cards;
      });
      // Visible Employer Cards (Employer list)
      employerCards$.subscribe(this.visibleEmployerCards$);

      // Visibility of the next button on employers list
      this.employersNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextEmployerButton$);

      // Load Employers
      // this.projectService.getProjectOpportunities(this.projectId, '3').subscribe((response: any) => {
      //   const currentEmployers = this.employers$.getValue();
      //   const accumulatedEmployers = currentEmployers.concat(response.employers);
      //   this.employers$.next(accumulatedEmployers);
      //   this.employersNextPageKey$.next(response.nextPageKey);
      //   this.featuredEmployerCardsLoaded = true;
      // });
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isIndustryListOverflowed();
    }, 1000);
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

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  onClickViewCrowdfunding() {
    if (this.project.slug) {
      window.open(environment.FUNDSPRING_URL + '/projects/' + this.project.slug);
    }
  }

  onClickMentorProfile(mentorId: string) {
    this.router.navigate(['mentor/' + mentorId]);
  }

  onClickEdit(projectId: string) {
    this.router.navigate(['project/' + projectId + '/edit']);
  }

  onClickApply() {
    this.buttonApplyErrorMessage = '';
    this.authService.isAuthenticated$.subscribe(loggedIn => {
      if (loggedIn) {
        if (localStorage.getItem('isApprentice') === 'true') {
          this.projectService.addMeAsApprentice(this.projectId).subscribe(
            () => {
              this.router.navigate(['/project/applied/']);
            },
            err => {
              if (err.status === 409) {
                this.buttonApplyErrorMessage = err.error;
                this.showAlreadyMemberError = true;
              }
            }
          );
        } else {
          this.router.navigate(['/participate/mentee'], { queryParams: { projectId: this.projectId } });
        }
      } else {
        this.authService.login(this.router.url);
      }
    });
  }

  onClickApplyMentor() {
    this.authService.isAuthenticated$.subscribe(loggedIn => {
      if (loggedIn) {
        if (localStorage.getItem('isMentor') === 'true') {
          this.router.navigate(['/participate/mentor/apply/']);
        } else {
          this.router.navigate(['/participate/mentor']);
        }
      } else {
        this.authService.login(this.router.url);
      }
    });
  }

  // TODO: need to be change it to load the active term correctly after getting the terms from project.programTerms
  projectTerm(activeTerms: any) {
    const date = formatDate(new Date(), 'MM/yyyy/dd', 'en').toString();
    const today = date.split('/').toString();
    this.num = parseInt(today, 10);
    if (
      this.project.apprenticeNeeds.programTerms.custom &&
      this.project.apprenticeNeeds.programTerms.custom.termName !== ''
    ) {
      this.mTerms = this.project.apprenticeNeeds.programTerms.custom.termName;
    } else if (activeTerms.length > 0) {
      if (activeTerms.length === 1) {
        this.mTerms = activeTerms[0];
      } else if (activeTerms && activeTerms.length >= 2) {
        this.determinateTerm(activeTerms);
      }
    } else {
      this.hideM = true;
    }
  }

  determinateTerm(terms: any): void {
    if (this.num <= 4) {
      const value = terms.indexOf('Spring');
      value > -1 ? (this.mTerms = 'Spring') : this.getNextSeason('Spring', terms);
    } else if (this.num >= 5 || this.num <= 8) {
      const value = terms.indexOf('Summer');
      value > -1 ? (this.mTerms = 'Summer') : this.getNextSeason('Summer', terms);
    } else if (this.num >= 9 || this.num <= 12) {
      const value = terms.indexOf('Fall');
      value > -1 ? (this.mTerms = 'Fall') : this.getNextSeason('Fall', terms);
    }
  }

  getNextSeason(text: string, terms: any) {
    switch (text) {
      case 'Spring': {
        if (terms.indexOf('Summer') > -1) {
          this.mTerms = 'Summer';
        } else if (terms.indexOf('Fall') > -1) {
          this.mTerms = 'Fall';
        }
        break;
      }
      case 'Summer': {
        if (terms.indexOf('Fall') > -1) {
          this.mTerms = 'Fall';
        } else if (terms.indexOf('Spring') > -1) {
          this.mTerms = 'Spring';
        }
        break;
      }
      case 'Fall': {
        if (terms.indexOf('Spring') > -1) {
          this.mTerms = 'Spring';
        } else if (terms.indexOf('Summer') > -1) {
          this.mTerms = 'Summer';
        }
        break;
      }
    }
  }

  convertIndustryToArray(industry: string) {
    return industry.split(',');
  }

  @HostListener('window:resize')
  isIndustryListOverflowed() {
    if (this.industryList) {
      const element = this.industryList.nativeElement as HTMLElement;
      if (element) {
        this.isListOverflowed =
          element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
      }
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.stickyMarker) {
      const marker = this.stickyMarker.nativeElement as HTMLElement;
      const top = marker.offsetTop;
      this.isScrolled = window.pageYOffset > top;
    }
  }

  onTabChange(tab: any) {
    this.needWideContainer = tab.link === 'mentees';
  }

  doesOneActiveTermExists(): boolean {
    if (this.project) {
      return (
        this.project.programTerms && this.project.programTerms.find((term: any) => term.Active.toLowerCase() === 'open')
      );
    }
    return false;
  }

  areApplicationsOpenAndActiveTermExists(): boolean {
    if (this.project) {
      if (this.project.acceptApplications && this.doesOneActiveTermExists()) {
        this.applyBtnLabel = 'Apply';
        return true;
      } else {
        this.applyBtnLabel = 'Applications Closed';
        return false;
      }
    }
    return false;
  }

  removeSponsorsLimit() {
    this.sponsorsLimit = this.projectOpportunities.length;
  }

  scroll(element: string) {
    if (this.stickyTabBar) {
      if (this.stickyTabBar.selectedTab.label === 'Dashboard') {
        this.scrollToElement(element);
        return;
      }
      this.router.navigateByUrl(this.stickyTabBar.baseRoute);
      setTimeout(() => {
        this.scrollToElement(element);
      }, 2000);
    } else {
      this.scrollToElement(element);
    }
  }

  private scrollToElement(element: string) {
    const elementRef = document.getElementById(element) as HTMLElement;
    if (elementRef) {
      elementRef.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private addLfAsSponsor() {
    // Ensure that the Linux Foundation is always in the sponsors list when the amountRaised is greater than zero.
    let lfFound = false;
    for (let i = 0; i < this.projectOpportunities.length; i++) {
      if (this.projectOpportunities[i].name === 'Linux Foundation') {
        lfFound = true;
      }
    }
    if (!lfFound && this.project.amountRaised > 0) {
      const lfOpportunity = {
        name: 'Linux Foundation',
        logoUrl:
          'https://jobspring-prod-uploads.s3.amazonaws.com/8559571f-5946-4368-b41b-f428bc747e6c-Linux_Foundation_logo.png',
      };

      this.projectOpportunities[this.projectOpportunities.length] = lfOpportunity;
    }
  }

  openPopover(popover: any) {
    this.activePopover = popover;
    if (this.activePopover && !this.activePopover.isOpen()) {
      this.activePopover.open();
    }
  }

  closePopover() {
    if (this.activePopover && this.activePopover.isOpen()) {
      this.activePopover.close();
    }
  }
}
