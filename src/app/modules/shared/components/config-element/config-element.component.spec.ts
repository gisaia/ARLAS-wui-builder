import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigElementComponent } from './config-element.component';

describe('ConfigElementComponent', () => {
  let component: ConfigElementComponent;
  let fixture: ComponentFixture<ConfigElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigElementComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
