import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CiiComponent } from './cii.component';

describe('CiiComponent', () => {
  let component: CiiComponent;
  let fixture: ComponentFixture<CiiComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CiiComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CiiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
