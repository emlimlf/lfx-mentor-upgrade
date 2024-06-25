// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApprenticeCard } from '@app/models/user.model';
import { ProjectCard, ProjectResponse, ProjectMemberStatus } from '@app/models/project.model';
import { MenteeService } from '@app/services/mentee.service';
import { DownloadService } from '@app/services/download.service';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-apprentice-card',
  templateUrl: './apprentice-card.component.html',
  styleUrls: ['./apprentice-card.component.scss'],
})
export class ApprenticeCardComponent implements OnInit {
  @Input() apprenticeCard: ApprenticeCard = {} as any;
  @Input() menteeId?: string;
  @Input() projectsPrePopulated = false;
  @Input() editProfile = false;
  @Output() edit = new EventEmitter<ApprenticeCard>();

  myMenteeProjectCards: ProjectCard[] = [];
  projectMemberStatus = ProjectMemberStatus;
  activePopover: any;

  constructor(
    private router: Router,
    private menteeService: MenteeService,
    private downloadService: DownloadService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.apprenticeCard.fullName =
      this.apprenticeCard.fullName.length >= 153
        ? this.apprenticeCard.fullName.slice(0, 153).concat('...')
        : this.apprenticeCard.fullName;

    if (!this.apprenticeCard.avatarUrl || (this.apprenticeCard.avatarUrl as string).includes('s.gravatar')) {
      this.apprenticeCard.avatarUrl = this.downloadService._defaultLogo({
        first: this.apprenticeCard.fullName,
        last: '',
      });
    }

    (this.apprenticeCard.mentors as any[]).forEach(mentor => {
      if ((mentor.avatar && (mentor.avatar as string).includes('s.gravatar')) || !mentor.avatar) {
        mentor.avatar = this.downloadService._defaultLogo({
          first: mentor.name,
          last: '',
        });
      }
    });

    if (
      (this.apprenticeCard.avatarUrl && (this.apprenticeCard.avatarUrl as string).includes('s.gravatar')) ||
      !this.apprenticeCard.avatarUrl
    ) {
      this.apprenticeCard.avatarUrl = encodeURI(
        this.downloadService._defaultLogo({
          first: this.apprenticeCard.fullName,
          last: '',
        })
      );
    }

    // load any and all projects this Mentee has been approved to participate in
    let apprenticeId = this.apprenticeCard.id;
    if (this.menteeId === 'local') {
      apprenticeId = localStorage.getItem('userId') as string;
    }

    if (!this.projectsPrePopulated) {
      // find all Projects for this Mentee
      this.menteeService
        .getMenteePublicProjectsWithNoLimit(apprenticeId)
        .subscribe((projectResponse: ProjectResponse) => {
          if (
            projectResponse.projects &&
            projectResponse.projects.length > 0 &&
            projectResponse.acceptanceStatusList &&
            projectResponse.acceptanceStatusList.length > 0
          ) {
            let latestStatusRecord: any;
            if (projectResponse.acceptanceStatusList.length === 1) {
              latestStatusRecord = projectResponse.acceptanceStatusList[0];
            } else {
              // Show first project for which mentee was accepted.
              latestStatusRecord = this.getProjectWithStatus(projectResponse, this.projectMemberStatus.Accepted);

              // If there is no project with accepted status and then show first project for which mentee was graduated.
              if (!latestStatusRecord) {
                latestStatusRecord = this.getProjectWithStatus(projectResponse, this.projectMemberStatus.Graduated);
              }

              // If there is no project with accepted or graduated status and then show first project for which mentee was pending.
              if (!latestStatusRecord) {
                latestStatusRecord = this.getProjectWithStatus(projectResponse, this.projectMemberStatus.Pending);
              }

              // If there is no project with accepted, graduated or pending status and then show first project for which mentee was withdrawn.
              if (!latestStatusRecord) {
                latestStatusRecord = this.getProjectWithStatus(projectResponse, this.projectMemberStatus.Withdrawn);
              }

              // If there is no project with accepted, graduated, pending or withdrawn status and then show first project for which mentee was declined.
              if (!latestStatusRecord) {
                latestStatusRecord = this.getProjectWithStatus(projectResponse, this.projectMemberStatus.Declined);
              }
            }
            if (latestStatusRecord && latestStatusRecord.status) {
              const latestProject = projectResponse.projects.find(
                (project: any) => project.projectId === latestStatusRecord.projectId
              );
              if (latestProject) {
                const { name, logoUrl, projectId } = latestProject;
                this.myMenteeProjectCards.push({
                  title: name,
                  logoUrl,
                  projectId,
                  menteeStatus: latestStatusRecord.status,
                } as ProjectCard);

                if (latestProject.apprenticeNeeds && latestProject.apprenticeNeeds.mentors) {
                  // Display mentors for only selected project.
                  this.apprenticeCard.mentors = [];
                  const mentors: any = [];
                  latestProject.apprenticeNeeds.mentors.forEach(mentor => {
                    if (!mentor.avatarUrl) {
                      mentor.avatarUrl = this.downloadService._defaultLogo({
                        first: mentor.name,
                        last: '',
                      });
                    }
                    mentors.push({
                      name: mentor.name,
                      avatarUrl: mentor.avatarUrl,
                    });
                  });
                  this.apprenticeCard.mentors = [...mentors];
                }
              }
            }
          }
        });
    } else if (this.projectsPrePopulated && this.apprenticeCard.projects && this.apprenticeCard.projects.length > 0) {
      this.apprenticeCard.projects.forEach(({ name, logoUrl, projectId, menteeStatus }) => {
        this.myMenteeProjectCards.push({ title: name, logoUrl, projectId, menteeStatus } as ProjectCard);
      });
    }
  }

  private getProjectWithStatus(response: any, status: ProjectMemberStatus) {
    let latestStatusRecord;
    const acceptedProjects = response.acceptanceStatusList.filter((acl: any) => acl.status === status);
    if (acceptedProjects.length > 0) {
      latestStatusRecord = acceptedProjects.reduce((a: any, b: any) =>
        new Date(a.updatedAt) < new Date(b.updatedAt) ? a : b
      );
    }
    return latestStatusRecord;
  }

  onClickEditProfile() {
    this.userService.isClickAction$.next(true);
    this.edit.emit(this.apprenticeCard);
  }

  onClickViewProfile() {
    this.router.navigate(['/mentee/' + this.apprenticeCard.id]);
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
