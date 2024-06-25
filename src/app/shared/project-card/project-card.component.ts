// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { ProjectCard, ProjectMemberStatus, ProjectMentor, MenteeResponse } from '@app/models/project.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreState, QueueAlertAction, AlertType, ProjectStatus } from '@app/core';
import { Store } from '@ngrx/store';
import { environment } from '@app/../environments/environment';
import {
  DeleteProjectModalComponent,
  DeleteMenteeProject,
} from '../delete-project-modal/delete-project-modal.component';
import { MenteeService } from '@app/services/mentee.service';
import { DownloadService } from '@app/services/download.service';
import * as moment from 'moment-timezone';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

type CardView = 'public' | 'maintainer-private' | 'mentor-private' | 'mentee-private';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
})
export class ProjectCardComponent implements OnInit, OnDestroy {
  @Input() projectCard: ProjectCard = {} as ProjectCard;
  @Input() allowApplyButton?: boolean;
  @Input() allowViewApplicationAndTasksButton = true;
  @Input() maintainer = false;
  @Input() mentee = false;
  @Input() mentor = false;
  @Input() cardView: CardView = 'public';
  @Input() preloadedMentees = false;
  @Output() withdrawProject: EventEmitter<any> = new EventEmitter();
  private applyBtnClicked = new Subject<ProjectCard>();
  applyBtnLabel = 'Apply';
  disableApplyBtn = false;
  showAlreadyMemberError = false;
  projectTerms: any[] = [];
  projectMentees: any[] = [];
  projectGraduatedMentees: any[] = [];
  mentors: any;
  opportunities: any;
  funding: any;
  basic = {
    active: false,
    preview: false,
  };
  description: any;
  fundings: any;
  ProjectMemberStatus: any;
  private addButton: HTMLButtonElement | null = null;
  buttonApplyErrorMessage = '';
  allowApplicationsButton = false;
  selectedPill = 'left';
  ciiSVG!: SafeHtml;
  uniqueId = '';
  activePopover: any;
  ProjectStatus = ProjectStatus;
  confirmationPopup: any;

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private store: Store<CoreState>,
    private downloadService: DownloadService,
    private menteeService: MenteeService,
    private sanitizer: DomSanitizer
  ) {
    this.ProjectMemberStatus = ProjectMemberStatus;
    this.description = this.mentors = this.fundings = this.opportunities = this.basic;
  }

  ngOnInit() {
    // Check for empty avatars
    this.disableApplyBtn = !this.projectCard.acceptApplications || !this.areApplicationsOpenAndActiveTermExists();

    (this.projectCard.mentors as ProjectMentor[]).forEach(mentor => {
      if ((mentor.logoUrl && (mentor.logoUrl as string).includes('s.gravatar')) || mentor.logoUrl === '') {
        mentor.logoUrl = this.downloadService._defaultLogo({
          first: mentor.name,
          last: '',
        });
      } else if (!mentor.logoUrl) {
        mentor.logoUrl = this.downloadService._defaultLogo({
          first: mentor.name,
          last: '',
        });
      }
    });

    const applyBtnClickedDebounced = this.applyBtnClicked.pipe(debounceTime(1200));
    applyBtnClickedDebounced.subscribe((projectCard: ProjectCard) => {
      this.processApplyClick(projectCard);
    });

    this.addLfAsSponsor();

    if (this.projectCard && this.projectCard.mentors) {
      this.projectCard.mentors.forEach(mentor => {
        mentor.logoUrl = mentor.logoUrl
          ? mentor.logoUrl
          : this.downloadService._defaultLogo({ first: mentor.name, last: '' });
      });
    }

    if (!this.projectCard.acceptApplications || !this.areApplicationsOpenAndActiveTermExists()) {
      this.applyBtnLabel = 'Applications Closed';
    }

    this.funding = {};
    this.funding.amountRaised = Math.ceil((this.projectCard.amountRaised || 0) / 100);

    // Load current mentees on the card.
    this.acceptedMentees();

    // Load graduated mentees on the card.
    this.graduatedMentees();

    this.projectTerms =
      this.projectCard.terms &&
      this.projectCard.terms.slice(0, 2).map(term => {
        const uiStartDateTime = moment(term.startDateTime).isValid() ? this.formatDate(term.startDateTime) : '';
        const uiEndDateTime = moment(term.endDateTime).isValid() ? this.formatDate(term.endDateTime) : '';
        return {
          ...term,
          uiStartDateTime,
          uiEndDateTime,
        };
      });

    this.allowApplicationsButton = (this.projectTerms.length > 0 &&
      this.projectCard.programTermStatus &&
      this.projectCard.programTermStatus === 'open') as boolean;

    if (this.projectCard.ciiMarkup) {
      this.ciiSVG = this.sanitizer.bypassSecurityTrustHtml(this.projectCard.ciiMarkup);
    }

    if (this.projectCard.title) {
      this.uniqueId = this.projectCard.title.replace(/ /g, '').toLowerCase();
    }
  }

  ngOnDestroy(): void {
    if (this.confirmationPopup) {
      this.confirmationPopup.dismiss();
    }
  }

  onDetailsClick() {
    if (
      this.projectCard.status &&
      this.projectCard.status.toLowerCase() !== 'hide' &&
      this.projectCard.status.toLowerCase() !== 'hidden'
    ) {
      ProjectService.isClickAction$.next(true);
    } else {
      ProjectService.isClickAction$.next(false);
    }
  }
  formatDate(unixValue: any) {
    return moment
      .unix(unixValue)
      .utc()
      .format('MMM YYYY');
  }
  onClickApply(projectCard: ProjectCard, $event: any) {
    // Prevents bubble up to following the routerLink specified in the template
    $event.stopPropagation();
    this.applyBtnLabel = 'Processing...';
    this.applyBtnClicked.next(projectCard);
  }

  processApplyClick(projectCard: ProjectCard) {
    this.showAlreadyMemberError = false;
    this.buttonApplyErrorMessage = '';
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.projectService.getProjectUserRoles(this.projectCard.projectId).subscribe(roles => {
        if (roles.length > 0 && this.projectCard.acceptApplications) {
          this.buttonApplyErrorMessage = `You can't apply to this project because you're a ${roles.join(
            ' and '
          )} for it.`;
          this.showAlreadyMemberError = true;
          this.setBtnState('done');
        } else {
          if (localStorage.getItem('isApprentice') === 'true') {
            // hacky loading message to prevent double-clicking while the
            // application is sending the request
            this.applyBtnLabel = 'Applying...';
            this.projectCard.acceptApplications = false;
            this.projectService.addMeAsApprentice(projectCard.projectId).subscribe(
              () => {
                this.setBtnState('done');
                this.router.navigate(['project/applied/']);
              },
              error => {
                if (error.status === 409) {
                  this.buttonApplyErrorMessage = error.error;
                  this.showAlreadyMemberError = true;
                  this.setBtnState('done');
                }
              }
            );
          } else {
            this.setBtnState('done');
            this.router.navigate(['/participate/mentee'], {
              queryParams: { projectId: projectCard.projectId },
            });
          }
        }
      });
    } else {
      this.setBtnState('done');
      this.router.navigate(['/participate/mentee'], {
        queryParams: { projectId: projectCard.projectId },
      });
    }
  }

  setBtnState(str: string) {
    if (this.addButton !== null) {
      if (str === 'done') {
        this.applyBtnLabel = 'Apply';
        this.addButton.disabled = false;
      }
    }
  }

  onClickViewProject(projectCard: ProjectCard) {
    ProjectService.isClickAction$.next(true);
    this.router.navigate(['project/' + projectCard.projectId]);
  }

  onClickEditProject(projectCard: ProjectCard) {
    ProjectService.isClickAction$.next(true);
    this.router.navigate(['project/' + projectCard.projectId + '/edit']);
  }

  viewTasks() {
    this.router.navigate(['/'], { fragment: 'my-tasks' });
  }

  viewApplicationsAndTasks() {
    this.router.navigate(['project/' + this.projectCard.projectId + '/mentees']);
  }

  async onClickWithdraw(projectCard: ProjectCard) {
    ProjectService.isClickAction$.next(true);
    const modalRef = this.modalService.open(DeleteProjectModalComponent, {
      centered: true,
      windowClass: 'no-border modal-window',
    });

    const deleteProjectModal = modalRef.componentInstance as DeleteProjectModalComponent;
    deleteProjectModal.projectCard = projectCard;

    const result = await (modalRef.result as Promise<DeleteMenteeProject>);
    if (result === DeleteMenteeProject.PROJECT_DELETED) {
      const menteeId = localStorage.getItem('userId') as string;
      this.menteeService.withdrawMenteeProject(menteeId, projectCard.projectId).subscribe(res => {
        this.withdrawProject.emit(res);
      });
    }
  }

  onClickDonate(event: any, projectCard: ProjectCard) {
    ProjectService.isClickAction$.next(true);
    event.stopPropagation();
    if (projectCard.fundspringProjectId) {
      window.open(environment.FUNDSPRING_URL + '/projects/' + projectCard.fundspringProjectId + '/payments');
    } else {
      window.open(environment.FUNDSPRING_URL + '/projects/' + projectCard.projectId + '/payments');
    }
  }

  async confirmUpdateAcceptApplication(project: any) {
    const flag = project.acceptApplications;
    this.projectService.updateAcceptApplicationsFlag(project.projectId, !flag).subscribe(
      () => {
        project.acceptApplications = !project.acceptApplications;
      },
      (err: any) => {
        this.store.dispatch(
          new QueueAlertAction({
            alertText: err.message,
            alertType: AlertType.ERROR,
          })
        );
      }
    );
  }

  displayWithDrawButton() {
    const only = [this.ProjectMemberStatus.Pending];

    return only.includes(this.projectCard.acceptanceStatus);
  }

  displayViewTasksButton() {
    const viewTaskStatus: any = [ProjectMemberStatus.Pending, ProjectMemberStatus.Accepted];
    return viewTaskStatus.includes(this.projectCard.acceptanceStatus);
  }

  areApplicationsOpenAndActiveTermExists(): boolean {
    if (this.projectCard) {
      const termAvailable =
        this.projectCard.terms && this.projectCard.terms.find((term: any) => term.Active.toLowerCase() === 'open');
      if (this.projectCard.acceptApplications && termAvailable) {
        this.applyBtnLabel = 'Apply';
        return true;
      } else {
        this.applyBtnLabel = 'Applications Closed';
        return false;
      }
    }
    return false;
  }

  trackByIndex(index: number) {
    return index;
  }

  addLfAsSponsor() {
    // Ensure that the Linux Foundation is always in the sponsors list when the amountRaised is greater than zero.
    let lfFound = false;
    if (this.projectCard && this.projectCard.opportunities) {
      this.projectCard.opportunities.forEach(project => {
        if (project.name === 'Linux Foundation') {
          lfFound = true;
        }
      });

      if (!lfFound && this.projectCard.amountRaised > 0) {
        const lfOpportunity = {
          name: 'Linux Foundation',
          logoUrl:
            'https://jobspring-prod-uploads.s3.amazonaws.com/8559571f-5946-4368-b41b-f428bc747e6c-Linux_Foundation_logo.png',
        };
        this.projectCard.opportunities[this.projectCard.opportunities.length] = lfOpportunity;
      }
    }
  }

  onPillSelection(selectedPill: string) {
    this.selectedPill = selectedPill;
  }

  private acceptedMentees() {
    if (this.preloadedMentees) {
      if (this.projectCard.apprenticeNeeds && this.projectCard.apprenticeNeeds.acceptedMentees) {
        this.projectMentees = this.projectCard.apprenticeNeeds.acceptedMentees;

        this.projectMentees.forEach(mentee => {
          if (!mentee.logoUrl || (mentee.logoUrl && (mentee.logoUrl as string).includes('s.gravatar'))) {
            mentee.logoUrl = this.downloadService._defaultLogo({
              first: mentee.firstName + ' ' + mentee.lastName,
              last: '',
            });
          }
        });
      }
    } else {
      this.projectService.getProjectMentees(this.projectCard.projectId).subscribe(menteesResponse => {
        this.projectMentees = menteesResponse.mentees;

        this.projectMentees.forEach(mentee => {
          if (!mentee.logoUrl || (mentee.logoUrl && (mentee.logoUrl as string).includes('s.gravatar'))) {
            mentee.logoUrl = this.downloadService._defaultLogo({
              first: mentee.firstName + ' ' + mentee.lastName,
              last: '',
            });
          }
        });
      });
    }
  }

  private graduatedMentees() {
    if (this.preloadedMentees) {
      if (this.projectCard.apprenticeNeeds && this.projectCard.apprenticeNeeds.graduatedMentees) {
        const mentees = this.projectCard.apprenticeNeeds.graduatedMentees;
        this.projectGraduatedMentees = this.projectGraduatedMentees.concat(mentees);
        this.projectGraduatedMentees.forEach(mentee => {
          if (!mentee.logoUrl || (mentee.logoUrl && (mentee.logoUrl as string).includes('s.gravatar'))) {
            mentee.logoUrl = this.downloadService._defaultLogo({
              first: mentee.firstName + ' ' + mentee.lastName,
              last: '',
            });
          }
        });
      }
    } else {
      this.projectService
        .getAllProjectMenteesByStatus(this.projectCard.projectId, 'graduated', '999')
        .subscribe((response: MenteeResponse) => {
          const { mentees } = response;
          this.projectGraduatedMentees = this.projectGraduatedMentees.concat(mentees);
          this.projectGraduatedMentees.forEach(mentee => {
            if (!mentee.logoUrl || (mentee.logoUrl && (mentee.logoUrl as string).includes('s.gravatar'))) {
              mentee.logoUrl = this.downloadService._defaultLogo({
                first: mentee.firstName + ' ' + mentee.lastName,
                last: '',
              });
            }
          });
        });
    }
  }

  toggleProjectHiddenStatus(confirmTpl: any) {
    ProjectService.isClickAction$.next(true);
    this.confirmationPopup = this.modalService.open(confirmTpl, {
      centered: true,
      backdrop: 'static',
      windowClass: 'no-border status-change-modal',
    });
    this.confirmationPopup.result.then((result: any) => {
      if (!result) {
        return;
      }
      const projectId = this.projectCard.projectId;
      const newStatus =
        this.projectCard.status && this.projectCard.status.toLowerCase() === 'published' ? 'hide' : 'unhide';
      this.projectService.changeProjectStatus(projectId, newStatus).subscribe(
        (response: any) => {
          this.projectCard.status = response.status;
          this.store.dispatch(
            new QueueAlertAction({
              alertText: `${this.projectCard.title} ${newStatus === 'hide' ? 'hide' : 'Published'} successfully`,
              alertType: AlertType.SUCCESS,
            })
          );
        },
        (error: any) => {
          this.store.dispatch(
            new QueueAlertAction({
              alertText: `Failed to ${newStatus === 'hide' ? 'hide' : 'Published'} ${this.projectCard.title}`,
              alertType: AlertType.ERROR,
            })
          );
        }
      );
    });
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
