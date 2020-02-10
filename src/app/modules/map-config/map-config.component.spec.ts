import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapConfigComponent } from './map-config.component';

describe('MapConfigComponent', () => {
  let component: MapConfigComponent;
  let fixture: ComponentFixture<MapConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
