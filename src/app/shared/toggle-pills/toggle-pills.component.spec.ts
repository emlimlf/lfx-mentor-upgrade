import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglePillsComponent } from './toggle-pills.component';

describe('TogglePillsComponent', () => {
  let component: TogglePillsComponent;
  let fixture: ComponentFixture<TogglePillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TogglePillsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglePillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
