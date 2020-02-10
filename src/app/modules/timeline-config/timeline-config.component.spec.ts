import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineConfigComponent } from './timeline-config.component';

describe('TimelineConfigComponent', () => {
  let component: TimelineConfigComponent;
  let fixture: ComponentFixture<TimelineConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
