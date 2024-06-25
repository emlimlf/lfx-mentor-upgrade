// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectService } from '@app/services/project.service';
import { Employer, EmployerCard, Job, ParticipationStatus } from '@app/models/employer.model';
import { Project, Mentor, Mentee, MentorResponse, MenteeResponse } from '@app/models/project.model';
import { Profile } from '@app/models/user.model';
import { UserService } from '@app/services/user.service';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-project-public',
  templateUrl: './project-public.component.html',
  styleUrls: ['./project-public.component.scss'],
})
export class ProjectPublicComponent implements OnInit, AfterViewInit {
  projectId = '';
  projectMentors: Mentor[] = [];
  projectActiveMentees: Mentee[] = [];
  projectGraduatedMentees: Mentee[] = [];
  isAdmin: any;
  isMentor: any;
  isMaintainer: any;
  project: any = {};
  project$ = new Subject<Project>();
  profiles: any[] = [];
  projectMentor$ = new Subject<MentorResponse>();
  projectActiveMentee$ = new Subject<MenteeResponse>();
  projectGraduatedMentee$ = new Subject<MenteeResponse>();
  activeShouldShowNextButton$ = new BehaviorSubject<boolean>(false);
  activeNextPageKey$ = new BehaviorSubject<string>('');
  showAcceptedMentees = false;

  // Employers
  employers$ = new BehaviorSubject<Employer[]>([]);
  employerCardList: EmployerCard[] = [];
  employerCardListLoaded = false;
  employerIDToJobs$ = new BehaviorSubject<{ [employerID: string]: Job[] }>({});

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private downloadService: DownloadService,
    private userService: UserService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.projectId = routeParams.id;
      this.projectService.getProject(this.projectId).subscribe(this.project$);
      this.projectService.getProjectMentees(this.projectId).subscribe(this.projectActiveMentee$);
      this.projectService
        .getAllProjectMenteesByStatus(this.projectId, 'graduated', '3', undefined)
        .subscribe(this.projectGraduatedMentee$);

      this.project$.subscribe(results => {
        this.project = results;
        this.showAcceptedMentees = this.areApplicationsOpenOrHasActiveTerms();
        ((this.project.apprenticeNeeds.mentors as any[]) || []).forEach(mentor => {
          if (!mentor.logoUrl || (mentor.logoUrl as string).includes('s.gravatar')) {
            mentor.logoUrl = this.downloadService._defaultLogo({
              first: mentor.name,
              last: '',
            });
          }
        });
        this.projectMentors = this.project.apprenticeNeeds.mentors;
      });

      this.projectActiveMentee$.subscribe(results => {
        this.projectActiveMentees = results.mentees;
        this.projectActiveMentees.forEach(mentee => {
          this.defaultLogo(mentee, mentee.firstName, mentee.lastName);
        });
      });

      this.projectGraduatedMentee$.subscribe(results => {
        this.projectGraduatedMentees = results.mentees;
        this.projectGraduatedMentees.forEach(mentee => {
          this.defaultLogo(mentee, mentee.firstName, mentee.lastName);
        });
        this.activeNextPageKey$.next(results.nextPageKey);
      });
      this.activeNextPageKey$.pipe(map(key => !!key)).subscribe(this.activeShouldShowNextButton$);

      const employerCardList$ = combineLatest(this.employers$, this.employerIDToJobs$)
        .pipe(
          map(([employers, employerIDToJobs]) => {
            employers = employers.filter(
              x => x.interviewOpportunities.participatingFunding || x.interviewOpportunities.participatingHiring
            );
            return employers.map(employer => this.convertEmployerIntoEmployerCard(employer));
          })
        )
        .pipe(map(employerCardList => employerCardList))
        .subscribe(cards => {
          this.employerCardList = cards;
        });

      // Load Employers
      // this.projectService.getProjectOpportunities(this.projectId).subscribe((response: any) => {
      //   const currentEmployerList = this.employers$.getValue();
      //   // const accumulatedEmployers = currentEmployerList.concat(response.employers);
      //   this.employers$.next(response.employers);
      //   this.employerCardListLoaded = true;
      // });
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const fragment = this.activeRoute.fragment;
      fragment.subscribe(name => {
        const element = document.getElementById(name) as HTMLElement;
        if (element) {
          switch (name.toLowerCase()) {
            case 'mentors':
            case 'mentees':
              element.scrollIntoView(true);
              window.scroll(0, window.scrollY - 110);
              break;
            default:
              break;
          }
        }
      });
    }, 1000);
  }

  private convertEmployerIntoEmployerCard(employer: Employer): EmployerCard {
    const { interviewOpportunities } = employer;
    const fundingOpportunities = interviewOpportunities.fundingOpportunities;
    const hiringOpportunities = interviewOpportunities.hiringOpportunities;

    const participationStatus = {
      participatingHiring: interviewOpportunities.participatingHiring,
      participatingFunding: interviewOpportunities.participatingFunding,
    } as ParticipationStatus;
    return {
      participationStatus,
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

  onClickMentorProfile(mentorId: string) {
    this.router.navigate(['mentor/' + mentorId]);
  }

  onClickMenteeProfile(menteeId: string) {
    this.router.navigate(['mentee/' + menteeId]);
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // export(event: any) {
  //   switch (event) {
  //     case 'mentors':
  //       this.beginCSVExport(this.projectMentors, 'mentor');
  //       break;
  //     case 'mentees':
  //       this.beginCSVExport(this.projectActiveMentees, 'apprentice');
  //       break;
  //   }
  // }

  // beginCSVExport(applicants: any[], mode: any) {
  //   this.profiles = [];
  //   applicants.forEach(applicant => {
  //     const req$ = this.userService.getPrvProfileByType(applicant.userId, mode);
  //     this.profiles.push(req$);
  //   });
  //   forkJoin(...this.profiles)
  //     .pipe(
  //       map(([...profile]: Profile[]) => {
  //         return { profile };
  //       })
  //     )
  //     .subscribe(res => {
  //       const key = mode === 'mentor' ? 'mentors' : 'mentees';
  //       this.downloadService.downloadFile(res.profile, 'jsontocsv', key);
  //     });
  // }

  onClickGraduatedMenteesNext() {
    const pageKey = this.activeNextPageKey$.getValue();
    if (!pageKey) {
      return;
    }

    this.projectService
      .getAllProjectMenteesByStatus(this.projectId, 'graduated', '3', pageKey)
      .subscribe((response: MenteeResponse) => {
        const { mentees, nextPageKey } = response;
        this.projectGraduatedMentees = this.projectGraduatedMentees.concat(mentees);
        this.projectGraduatedMentees.forEach(mentee => {
          this.defaultLogo(mentee, mentee.firstName, mentee.lastName);
        });
        this.activeNextPageKey$.next(nextPageKey);
      });
  }

  areApplicationsOpenOrHasActiveTerms(): boolean {
    if (this.project && this.project.programTerms) {
      const termAvailable = this.project.programTerms.find((term: any) => term.Active.toLowerCase() === 'open');
      return this.project.acceptApplications || termAvailable ? true : false;
    }
    return false;
  }

  private defaultLogo(entity: any, firstName: string, lastName: string) {
    if (!entity.avatarUrl || (entity.avatarUrl && (entity.avatarUrl as string).includes('s.gravatar'))) {
      entity.avatarUrl = this.downloadService._defaultLogo({
        first: firstName,
        last: lastName,
      });
    }
  }
}
