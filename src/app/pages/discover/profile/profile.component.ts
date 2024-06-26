// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, forkJoin, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { EmployerResponse, EmployerCard, Employer, ParticipationStatus } from '@app/models/employer.model';
import { ApprenticeCard, MentorCard, Profile, MentorUser } from '@app/models/user.model';
import { EmployerService } from '@app/services/employer.service';
import { UserService } from '@app/services/user.service';
import { DownloadService } from '@app/services/download.service';
import { fadeInTop } from '@app/shared/general-animations';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeInTop],
})
export class ProfileComponent implements OnInit, OnDestroy {
  tasks: any;
  public activeTab = '';
  private unsubscribe$: Subject<void> = new Subject();

  // Profiles
  employerProfiles: { [id: string]: EmployerCard } = {};
  apprenticeProfile: ApprenticeCard = {} as any;
  mentorProfile: MentorCard = {} as any;
  isLoadingProfiles = true;
  isLoadingProjects = true;
  showJumpToTopIcon = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private employerService: EmployerService,
    private downloadService: DownloadService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // No need to check for authentication since tab is only visible to logged in users.
    // Listen to tab changes.
    this.activatedRoute.fragment.pipe(takeUntil(this.unsubscribe$)).subscribe((fragment: string | null) => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });

    // Fetch profiles.
    this.getProfiles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ([apprentice, mentor]) => {
          this.apprenticeProfile = apprentice;
          // this.employerProfiles = employers;
          this.mentorProfile = mentor;

          this.isLoadingProfiles = false;
        },
        _ => {
          this.isLoadingProfiles = false;
        }
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  @HostListener('window:scroll') // for window scroll events
  onScroll() {
    this.showJumpToTopIcon = window.scrollY > 180;
  }

  get employerIds(): string[] {
    return Object.keys(this.employerProfiles);
  }

  get isApprentice(): boolean {
    const { apprenticeProfile } = this;

    return Boolean(apprenticeProfile && Object.keys(apprenticeProfile).length);
  }

  get isMentor(): boolean {
    const { mentorProfile } = this;

    return Boolean(mentorProfile && Object.keys(mentorProfile).length);
  }

  private apprenticeToApprenticeCard(profile: Profile): ApprenticeCard {
    const cs = profile.skillSet && profile.skillSet.skills;
    const ds = profile.skillSet && profile.skillSet.improvementSkills;

    return {
      id: profile.userId || profile.id || '',
      topHeaderStyle: {
        fill: '#023465',
      },
      fullName: `${profile.firstName} ${profile.lastName}`,
      avatarUrl: profile.logoUrl,
      introduction: profile.introduction || '',
      currentSkills: cs || [],
      desiredSkills: ds || [],
      projects: [],
      mentors: (profile.mentors || []) as any,
    };
  }

  // private employersToEmployerCards(response: EmployerResponse) {
  //   return response.employers.reduce((obj: { [id: string]: Employer }, employer: Employer) => {
  //     const { id } = employer;
  //     const employerCard = this.employerToEmployerCard(employer);

  //     return { ...obj, [id]: employerCard };
  //   }, {});
  // }

  private employerToEmployerCard(employer: Employer): EmployerCard {
    const { companyName: title, description: description, logoUrl, status, interviewOpportunities } = employer;
    const fundingOpportunities = interviewOpportunities.fundingOpportunities;
    const hiringOpportunities = interviewOpportunities.hiringOpportunities;
    const participationStatus = {
      participatingHiring: interviewOpportunities.participatingHiring,
      participatingFunding: interviewOpportunities.participatingFunding,
    } as ParticipationStatus;

    return {
      participationStatus,
      description,
      logoUrl,
      title,
      topHeaderStyle: {
        fill: 'rgb(40,170,76)', // TODO Where to get?
      },
      totalFunding:
        fundingOpportunities && fundingOpportunities.amount >= 0
          ? '$' + this.numberWithCommas(fundingOpportunities.amount)
          : '',
      opportunities: hiringOpportunities ? hiringOpportunities.interviews : 0,
      participation:
        hiringOpportunities && hiringOpportunities.HiringOpportunitiesProjectDetails
          ? hiringOpportunities.HiringOpportunitiesProjectDetails
          : [], // TODO Where to get?
      status,
    };
  }

  private getMenteesAndGraduates(id: string): any {
    let result: any = {};
    this.userService.getMentor('9', '', '', id).subscribe(response => {
      if (response.users !== null) {
        const { mentees, graduates, profiles } = response.users[0];
        result['projects'] = profiles[0].projects;
        result['mentees'] = mentees;
        result['graduates'] = graduates;
      }
    });
    return result;
  }

  private convertMentorUserIntoMentorCard(mentorUser: MentorUser): MentorCard {
    const _profiles = mentorUser.profiles.filter(x => x.type === 'mentor');
    const filteredProfile =
      _profiles.length == 0
        ? []
        : _profiles.length == 1
        ? _profiles[0]
        : _profiles.length > 1
        ? _profiles[_profiles.length - 1]
        : [];

    const mentorProfile = filteredProfile as Profile;
    const firstName = mentorProfile.firstName;
    const lastName = mentorProfile.lastName;
    const skillTags = mentorProfile.skillSet && mentorProfile.skillSet.skills;
    const projects = mentorProfile.projects || [];

    const result = {
      id: mentorUser.id,
      topHeaderStyle: {
        fill: '#023465',
      },
      avatarUrl:
        mentorProfile.logoUrl ||
        this.downloadService._defaultLogo({
          first: firstName,
          last: lastName,
        }),
      title: `${firstName} ${lastName}`,
      description: mentorProfile.introduction || '',
      skillTags: skillTags || [],
      graduates: mentorUser.graduates || [], // Where to get?
      projects,
      apprentices: mentorUser.mentees || [],
      subcardShown: null,
    };
    return result;
  }

  //DEPRECATED METHOD
  private mentorToMentorCard(mentor: any): MentorCard {
    const { id, introduction: description, firstName, lastName, logoUrl: avatarUrl, skillSet } = mentor;

    const mentees: any[] = [];
    const graduates: any[] = [];

    const title = `${firstName} ${lastName}`;
    const skillTags = (skillSet && skillSet.skills) || [];

    const projects = mentor.projects || [];
    return {
      apprentices: mentees, // TODO: Where to get?
      avatarUrl,
      description,
      graduates: graduates, // Where to get?
      id,
      projects: projects, // TODO: Where to get?
      skillTags,
      subcardShown: null,
      title,
      topHeaderStyle: {
        fill: 'rgb(110,110,110)', // TODO Where to get?
      },
    };
  }

  private getApprenticeProfile(userId: string): Observable<ApprenticeCard> {
    if (!localStorage.getItem('isApprentice')) {
      return of(<any>{});
    }

    return this.userService.getProfileByType(userId, 'apprentice').pipe(
      map((apprentice: Profile) => {
        return this.apprenticeToApprenticeCard(apprentice);
      })
    );
  }

  // private getEmployerProfiles(userId: string): Observable<{ [id: string]: EmployerCard }> {
  //   const limit: any = 100;
  //   return this.employerService
  //     .getEmployers(limit, undefined, userId)
  //     .pipe(map((response: EmployerResponse) => this.employersToEmployerCards(response)));
  // }

  //DEPRECATED
  // private getMentorProfile(userId: string): Observable<MentorCard> {
  //   if (!localStorage.getItem('isMentor')) {
  //     return of(<any>{});
  //   }

  //   return this.userService.getProfileByType(userId, 'mentor')
  //     .pipe(map((mentor: Profile) => (this.mentorToMentorCard(mentor))));
  // }

  private getMentorProfile(userId: string): Observable<MentorCard> {
    if (!localStorage.getItem('isMentor')) {
      return of(<any>{});
    }
    return this.userService
      .getMentor('9', '', '', userId)
      .pipe(map((response: any) => this.convertMentorUserIntoMentorCard(response.users[0])));
  }

  private getProfiles(): Observable<[ApprenticeCard, MentorCard]> {
    const userId = localStorage.getItem('userId') as string;

    return forkJoin([
      this.getApprenticeProfile(userId),
      // this.getEmployerProfiles(userId),
      this.getMentorProfile(userId),
    ]);
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  onTabChange(ev: NgbTabChangeEvent) {
    this.router.navigate(['profile'], { fragment: ev.nextId });
  }

  editApprentice() {
    this.router.navigate(['/profile/mentee/edit']);
  }

  editEmployer(id: string) {
    this.router.navigate(['/profile/employer/edit'], { queryParams: { id } });
  }

  editMentor() {
    this.router.navigate(['/profile/mentor/edit']);
  }

  manageIdentity() {
    window.open('https://myprofile.linuxfoundation.org/');
  }

  userHasProfiles(): boolean {
    const { length: hasEmployerProfile } = Object.keys(this.employerProfiles);

    return this.isApprentice || this.isMentor || Boolean(hasEmployerProfile);
  }

  jumpTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
