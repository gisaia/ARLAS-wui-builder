import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookAndFeelConfigComponent } from './look-and-feel-config.component';

describe('LookAndFeelConfigComponent', () => {
  let component: LookAndFeelConfigComponent;
  let fixture: ComponentFixture<LookAndFeelConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LookAndFeelConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookAndFeelConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
