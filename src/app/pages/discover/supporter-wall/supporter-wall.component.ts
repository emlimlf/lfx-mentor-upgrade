import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  ProjectService,
  MentorshipStatistics,
  OrganizationalSupporter,
  PopularProgram,
  PopularMentor,
} from '@app/services/project.service';

@Component({
  selector: 'app-supporter-wall',
  templateUrl: './supporter-wall.component.html',
  styleUrls: ['./supporter-wall.component.scss'],
})
export class SupporterWallComponent implements OnInit {
  organizations: any[] = [];
  @ViewChild('mentorsSection') mentorsSection!: ElementRef;
  @ViewChild('programsSection') programsSection!: ElementRef;
  @ViewChild('organizationsSection') organizationsSection!: ElementRef;
  repeater!: NodeJS.Timer;
  toggleWallState = false;
  totalApplicants: number = 0;
  totalAcceptedApplicants: number = 0;
  totalGraduatedApplicants: number = 0;
  totalStipends: number = 0;
  organizationalSupporters: OrganizationalSupporter[] = [];
  popularPrograms: PopularProgram[] = [];
  popularMentors: PopularMentor[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.projectService.mentorshipStatistics().subscribe((mentorshipStatistics: MentorshipStatistics) => {
      this.totalApplicants = mentorshipStatistics.totalApplicants;
      this.totalAcceptedApplicants = mentorshipStatistics.totalAcceptedApplicants;
      this.totalGraduatedApplicants = mentorshipStatistics.totalGraduatedApplicants;
      this.totalStipends = Math.abs(mentorshipStatistics.TotalStipends);
      this.popularMentors = mentorshipStatistics.popularMentors;
      this.popularPrograms = mentorshipStatistics.popularPrograms;
      this.organizationalSupporters = mentorshipStatistics.organizationalSupporters;
    });

    this.toggleWallState = sessionStorage.getItem('isWallCollapsed') === 'true';
  }

  scrollToBottom(entity: string) {
    let elementPointer = this.mentorsSection.nativeElement;
    switch (entity) {
      case 'programs':
        elementPointer = this.programsSection.nativeElement;
        break;
      case 'organizations':
        elementPointer = this.organizationsSection.nativeElement;
        break;
    }

    this.repeater = setInterval(() => {
      elementPointer.scrollTo({
        top: elementPointer.scrollTop + 6,
        behavior: 'smooth',
      });
    }, 100);
  }

  clearIntervalRepeater() {
    clearInterval(this.repeater);
    this.mentorsSection.nativeElement.scrollTop = 0;
    this.programsSection.nativeElement.scrollTop = 0;
    this.organizationsSection.nativeElement.scrollTop = 0;
  }

  changeWallState() {
    this.toggleWallState = !this.toggleWallState;
    sessionStorage.setItem('isWallCollapsed', this.toggleWallState.toString());
  }
}
