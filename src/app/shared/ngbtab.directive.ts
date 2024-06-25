import { Directive, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({ selector: 'ngb-tabset' })
export class NgbtabDirective {
  constructor(private router: Router) {}

  @HostListener('click', ['$event.target'])
  onClick(tab: any) {
    if (tab) {
      switch (tab.id) {
        case 'featured-secondary-tab':
          this.onClickChangePageState('featured');
          break;
        case 'projects-secondary-tab':
          this.onClickChangePageState('projects');
          break;
        case 'mentors-secondary-tab':
          this.onClickChangePageState('mentors');
          break;
        case 'mentees-secondary-tab':
          this.onClickChangePageState('mentees');
          break;
        case 'my-mentorships-secondary-tab':
          this.onClickChangePageState('my-mentorships');
          break;
        case 'my-tasks-secondary-tab':
          this.onClickChangePageState('my-tasks');
          break;
        case 'my-account-secondary-tab':
          this.onClickChangePageState('my-account');
          break;
      }
    }
  }

  onClickChangePageState(tab: string) {
    this.router.navigate(['/'], { fragment: tab });
  }
}
