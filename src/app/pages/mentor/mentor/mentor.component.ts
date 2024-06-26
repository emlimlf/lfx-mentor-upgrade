// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Profile, ApprenticeCard, MenteeUser, MentorUser } from '@app/models/user.model';
import { Project, ProjectResponse, ProjectCard, MentorMenteesResponse } from '@app/models/project.model';
import { UserService } from '@app/services/user.service';
import { MentorService } from '@app/services/mentor.service';
import hexRgb from 'hex-rgb';
import { DownloadService } from '@app/services/download.service';

@Component({
  selector: 'app-mentor',
  templateUrl: './mentor.component.html',
  styleUrls: ['./mentor.component.scss'],
})
export class MentorComponent implements OnInit {
  profileId = '';
  profile$ = new Subject<Profile>();
  profile: any = {};
  profileLoaded = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private mentorService: MentorService,
    private downloadService: DownloadService
  ) {}

  // Project list page
  initalProjectValue: ProjectResponse = { projects: [], nextPageKey: '' };
  projects$ = new BehaviorSubject<Project[]>([]);
  projectPageOffset$ = new BehaviorSubject<number>(1);
  projectNextPageKey$ = new BehaviorSubject<string>('');
  ProjectCards: ProjectCard[] = [];
  ProjectCardsLoaded = false;
  visibleProjectCards$ = new BehaviorSubject<ProjectCard[]>([]);
  shouldShowNextButton$ = new BehaviorSubject<boolean>(false);

  //Mentee list page
  initalMenteeValue: MentorMenteesResponse = { users: [], nextPageKey: '' };
  mentees$ = new BehaviorSubject<MenteeUser[]>([]);
  menteePageOffset$ = new BehaviorSubject<number>(1);
  menteeNextPageKey$ = new BehaviorSubject<string>('');
  MenteeCards: ApprenticeCard[] = [];
  MenteeCardsLoaded = false;
  visibleMenteeCards$ = new BehaviorSubject<ApprenticeCard[]>([]);
  shouldShowNextMenteeButton$ = new BehaviorSubject<boolean>(false);

  // Graduated Mentee list page
  graduatedMentees$ = new BehaviorSubject<MenteeUser[]>([]);
  graduatedMenteeCards: ApprenticeCard[] = [];
  graduatedMenteeCardsLoaded = false;
  visibleGraduatedMenteeCards$ = new BehaviorSubject<ApprenticeCard[]>([]);

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.profileId = routeParams.id;
      this.userService.getProfileByType(this.profileId, 'mentor').subscribe(this.profile$);
      this.profile$.subscribe(results => {
        this.profile = results;

        this.profile.logoUrl =
          this.profile.logoUrl === ''
            ? this.downloadService._defaultLogo({ first: this.profile.firstName, last: this.profile.lastName })
            : this.profile.logoUrl;
        this.profileLoaded = true;
      });
      this.loadProjectCards();
      this.loadMenteeCards();
      this.loadGraduatedMenteeCards();
    });
  }

  onClickProjectNext() {
    const pageKey = this.projectNextPageKey$.getValue();
    if (!pageKey) {
      return;
    }

    // Load next page and set next page key
    this.getProjects(this.profileId, '3', pageKey).subscribe((response: ProjectResponse) => {
      const { projects, nextPageKey } = response;
      const currentProjects = this.projects$.getValue();
      this.projects$.next(currentProjects.concat(projects));
      this.projectNextPageKey$.next(nextPageKey);
    });
  }

  onClickMenteeNext() {
    const pageKey = this.menteeNextPageKey$.getValue();
    if (!pageKey) {
      return;
    }

    // Load next page and set next page key
    this.getProjects(this.profileId, '3', pageKey).subscribe((response: ProjectResponse) => {
      const { projects, nextPageKey } = response;
      const currentProjects = this.projects$.getValue();
      this.projects$.next(currentProjects.concat(projects));
      this.projectNextPageKey$.next(nextPageKey);
    });
  }

  private loadProjectCards() {
    const projectCards$ = this.projects$.pipe(
      map(projects =>
        projects.map(project => {
          return this.convertProjectIntoProjectCard(project);
        })
      ),
      tap(_ => this.scrollToFragments())
    );

    projectCards$.subscribe(cards => {
      this.ProjectCards = cards;
    });

    projectCards$.subscribe(this.visibleProjectCards$);

    this.projectNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextButton$);

    // Loading project data from server
    // TODO: implement pagination for mentor's project cards
    this.getProjects(this.profileId, '0').subscribe((projectResponse: ProjectResponse) => {
      const currentProjects = this.projects$.getValue();
      const accumulatedProjects = currentProjects.concat(projectResponse.projects);
      this.projects$.next(accumulatedProjects);
      this.projectNextPageKey$.next(projectResponse.nextPageKey);
      this.ProjectCardsLoaded = true;
    });
  }

  private loadMenteeCards() {
    const menteeCards$ = this.mentees$.pipe(
      map(mentees =>
        mentees.map(mentee => {
          return this.convertApprenticeToApprenticeCard(mentee.id, mentee.profiles);
        })
      ),
      tap(_ => this.scrollToFragments())
    );

    menteeCards$.pipe().subscribe(cards => {
      this.MenteeCards = cards;
    });

    menteeCards$.subscribe(this.visibleMenteeCards$);

    this.menteeNextPageKey$.pipe(map(key => !!key)).subscribe(this.shouldShowNextButton$);

    // Loading mentee data from server
    this.getMentees(this.profileId, 'accepted').subscribe((mentorMenteesResponse: MentorMenteesResponse) => {
      const currentMentees = this.mentees$.getValue();
      const accumulatedMentees = currentMentees.concat(mentorMenteesResponse.users);
      this.mentees$.next(accumulatedMentees);
      this.menteeNextPageKey$.next(mentorMenteesResponse.nextPageKey);
      this.MenteeCardsLoaded = true;
    });
  }

  private loadGraduatedMenteeCards() {
    const graduatedMenteeCards$ = this.graduatedMentees$.pipe(
      map(graduatedMentees =>
        graduatedMentees.map(graduatedMentee => {
          return this.convertApprenticeToApprenticeCard(graduatedMentee.id, graduatedMentee.profiles);
        })
      ),
      tap(_ => this.scrollToFragments())
    );

    graduatedMenteeCards$.pipe().subscribe(cards => {
      this.graduatedMenteeCards = cards;
    });

    // Loading mentee data from server
    this.getMentees(this.profileId, 'graduated').subscribe((mentorMenteesResponse: MentorMenteesResponse) => {
      const graduatedMentees = this.graduatedMentees$.getValue();
      const accumulatedGraduatedMentees = graduatedMentees.concat(mentorMenteesResponse.users);
      this.graduatedMentees$.next(accumulatedGraduatedMentees);
      this.graduatedMenteeCardsLoaded = true;
    });
  }

  private getProjectCardColor(project: Project): string {
    if (!project.color) {
      return 'rgb(128, 128, 128)';
    }
    const { red, green, blue } = hexRgb(project.color);
    return `rgb(${red}, ${green}, ${blue})`;
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
      logoUrl: project.logoUrl,
      tags: project.industry.split(','),
      title: project.name,
      description: project.description,
      terms,
      opportunities,
      mentors,
      acceptApplications: project.acceptApplications,
      fundspringProjectId: project.fundspringProjectId,
      amountRaised: project.amountRaised || 0,
      projectCIIProjectId: project.projectCIIProjectId,
      apprenticeNeeds: project.apprenticeNeeds,
    };
  }

  private getProjects(mentor: string, limit?: string, nextPageKey?: string): Observable<ProjectResponse> {
    return this.mentorService.getMentorProjects(mentor, limit, nextPageKey);
  }

  private getMentees(mentor: string, status: string): Observable<MentorMenteesResponse> {
    return this.mentorService.getMentorApprentices(mentor, '9999', status);
  }

  private convertApprenticeToApprenticeCard(menteeId: string, profiles: Profile[]): ApprenticeCard {
    let menteeMentors: any[] = [];
    let menteeProfiles = profiles.filter(x => x.type === 'apprentice');
    let profile = menteeProfiles[0];

    menteeProfiles.forEach(mentee => {
      const { mentors }: any = mentee;

      if (mentors) {
        for (let i = 0; i < mentors.length; i++) {
          menteeMentors.push({ name: mentors[i].name, avatar: mentors[i].avatar });
        }
      }
    });

    const cs = profile.skillSet && profile.skillSet.skills;
    const ds = profile.skillSet && profile.skillSet.improvementSkills;

    return {
      id: menteeId,
      topHeaderStyle: {
        fill: '#023465',
      },
      fullName: `${profile.firstName} ${profile.lastName}`,
      avatarUrl: profile.logoUrl,
      introduction: profile.introduction || '',
      currentSkills: cs || [],
      desiredSkills: ds || [],
      projects: [],
      mentors: menteeMentors,
    };
  }

  stringToDate(dateValue: string) {
    if (dateValue) {
      const d = new Date(dateValue.slice(0, 10));
      return d;
    }

    return '';
  }

  private scrollToFragments() {
    setTimeout(() => {
      const fragment = this.activeRoute.fragment;
      fragment.subscribe(name => {
        const element = document.getElementById(name || '') as HTMLElement;
        if (element) {
          switch ((name || '').toLowerCase()) {
            case 'projects':
            case 'mentees':
            case 'graduatedmentees':
              element.scrollIntoView(true);
              window.scroll(0, window.scrollY - 110);
              break;
            default:
              break;
          }
        }
      });
    }, 100);
  }
}
