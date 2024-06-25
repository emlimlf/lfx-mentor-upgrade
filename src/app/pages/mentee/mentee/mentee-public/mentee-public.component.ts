// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectCard, ProjectResponse } from '@app/models/project.model';
import { MenteeService } from '@app/services/mentee.service';
import hexRgb from 'hex-rgb';
import { BehaviorSubject, from, of } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';
import { MentorCard, MentorResponse, MentorUser, Profile } from '@app/models/user.model';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-mentee-public',
  templateUrl: './mentee-public.component.html',
  styleUrls: ['./mentee-public.component.scss'],
})
export class MenteePublicComponent implements OnInit {
  projects$ = new BehaviorSubject<Project[]>([]);
  projectCards: ProjectCard[] = [];
  projectCardsLoaded = false;
  showEmptyProjects = true;

  mentors$ = new BehaviorSubject<MentorUser[]>([]);
  mentorCards: MentorCard[] = [];
  mentorCardsLoaded = false;

  private menteeId = '';

  constructor(
    private menteeService: MenteeService,
    private activeRoute: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      const routeId = routeParams.id as string;
      this.menteeId = routeId.split(',')[0];
      // this.projectId = routeId.split(',')[1];
      this.getProjects();
      this.getMentors();
    });
  }

  // PROJECT METHODS
  private getProjects() {
    this.menteeService.getMenteePublicProjects(this.menteeId, 9).subscribe(
      (projectResponse: ProjectResponse) => {
        const currentProjects = this.projects$.getValue();
        const accumulatedProjects = currentProjects.concat(projectResponse.projects || []);
        this.projects$.next(accumulatedProjects);
      },
      _ => {
        // error if any
      },
      () => this.scrollToFragments()
    );

    const projectCards$ = this.projects$.pipe(
      map(projects =>
        projects.map(project => {
          return this.convertProjectIntoProjectCard(project);
        })
      )
    );

    projectCards$.subscribe(results => {
      this.projectCards = results;
      this.projectCardsLoaded = true;
      this.showEmptyProjects = true;

      if (
        results.length > 0 &&
        results.findIndex(card => card.menteeStatus === 'accepted' || card.menteeStatus === 'graduated') > -1
      ) {
        this.showEmptyProjects = false;
      }
    });
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
      menteeStatus: project.menteeStatus,
      acceptApplications: project.acceptApplications,
      fundspringProjectId: project.fundspringProjectId,
      amountRaised: project.amountRaised || 0,
      projectCIIProjectId: project.projectCIIProjectId,
      apprenticeNeeds: project.apprenticeNeeds,
    };
  }

  private getProjectCardColor(project: Project): string {
    if (!project.color) {
      return 'rgb(128, 128, 128)';
    }
    const { red, green, blue } = hexRgb(project.color);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  // MENTOR METHODS
  // NEW FIX POINTING TO GetMentorWithDetails BE
  private getMentors() {
    const mentorsDetails$ = this.menteeService.getMenteeMentors(this.menteeId, 9, undefined, undefined, true).pipe(
      mergeMap((mentorResponse: MentorResponse) => {
        if (mentorResponse && mentorResponse.users) {
          return from(mentorResponse.users).pipe(
            mergeMap(
              mentor => this.userService.getMentor('9', '', '', mentor.id).pipe(map(res => res.users[0])),
              (original, detail) => {
                original.graduates = detail.graduates;
                original.mentees = detail.mentees;
                return original;
              }
            ),
            toArray()
          );
        } else {
          return of([]);
        }
      })
    );

    mentorsDetails$.subscribe(mentors => {
      const currentMentors = this.mentors$.getValue();
      const accumulatedMentors = currentMentors.concat(mentors || []);
      this.mentors$.next(accumulatedMentors);
      this.scrollToFragments();
    });

    // Mentor Cards
    const mentorCards$ = this.mentors$.pipe(
      map(mentors => mentors.map(mentor => this.convertMentorUserIntoMentorCard(mentor)))
    );

    mentorCards$.subscribe(results => {
      this.mentorCards = results;
      this.mentorCardsLoaded = true;
    });
  }

  // MENTOR METHODS
  // DEPRECATED
  // private getMentors() {
  //  // this.userService.getMentor('9','','',mentor.id)
  //  // .pipe(map((response: any) => (this.convertMentorUserIntoMentorCard(response.users[0]))))

  //   const mentorsDetails$ = this.menteeService.getMenteeMentors(this.menteeId, 9)
  //     .pipe(
  //       mergeMap((mentorResponse: MentorResponse) => {
  //         if (mentorResponse && mentorResponse.users) {
  //           return from(mentorResponse.users).pipe(
  //             mergeMap(
  //               mentor => this.menteeService.getMentorProfile(mentor.id),
  //               (original, detail) => {
  //                 original.graduates = detail.graduates;
  //                 original.mentees = detail.mentees;
  //                 return original;
  //               }
  //             ),
  //             toArray(),
  //           )
  //         } else {
  //           return of([]);
  //         }

  //       }),
  //     );

  //   mentorsDetails$.subscribe(mentors => {
  //     console.log('mentors   ', mentors);
  //     const currentMentors = this.mentors$.getValue();
  //     const accumulatedMentors = currentMentors.concat(mentors || []);
  //     this.mentors$.next(accumulatedMentors);
  //   });

  //   // Mentor Cards
  //   const mentorCards$ = this.mentors$.pipe(

  //     map(mentors => mentors.map(mentor => this.convertMentorUserIntoMentorCard(mentor)))
  //   );

  //   mentorCards$.subscribe(results => {
  //     this.mentorCards = results;
  //     this.mentorCardsLoaded = true;
  //   });
  // }

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
        fill: 'rgb(110,110,110)',
      },
      avatarUrl: mentorProfile.logoUrl || mentorUser.avatarUrl || '',
      title: `${firstName} ${lastName}`,
      description: mentorProfile.introduction || '',
      skillTags: skillTags || [],
      graduates: mentorProfile.graduates || mentorUser.graduates || [], // Where to get?
      projects,
      apprentices: mentorProfile.mentees || mentorUser.mentees || [], // Where to get?
      subcardShown: null,
    };
  }

  private numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private scrollToFragments() {
    setTimeout(() => {
      const fragment = this.activeRoute.fragment;
      fragment.subscribe(name => {
        const element = document.getElementById(name) as HTMLElement;
        if (element) {
          switch (name.toLowerCase()) {
            case 'projects':
            case 'mentors':
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
