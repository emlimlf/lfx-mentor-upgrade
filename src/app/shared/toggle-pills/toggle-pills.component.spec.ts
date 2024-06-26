import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TogglePillsComponent } from './toggle-pills.component';

describe('TogglePillsComponent', () => {
  let component: TogglePillsComponent;
  let fixture: ComponentFixture<TogglePillsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TogglePillsComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglePillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
