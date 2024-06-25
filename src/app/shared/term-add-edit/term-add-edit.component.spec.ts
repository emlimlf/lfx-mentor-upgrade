import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermAddEditComponent } from './term-add-edit.component';

describe('TermAddEditComponent', () => {
  let component: TermAddEditComponent;
  let fixture: ComponentFixture<TermAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TermAddEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
