import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalResultListComponent } from './global-result-list.component';

describe('GlobalResultListComponent', () => {
  let component: GlobalResultListComponent;
  let fixture: ComponentFixture<GlobalResultListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalResultListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalResultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
