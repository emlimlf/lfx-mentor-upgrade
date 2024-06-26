import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenteesTabAddTasksComponent } from './mentees-tab-add-tasks.component';

describe('MenteesTabAddTasksComponent', () => {
  let component: MenteesTabAddTasksComponent;
  let fixture: ComponentFixture<MenteesTabAddTasksComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MenteesTabAddTasksComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MenteesTabAddTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
