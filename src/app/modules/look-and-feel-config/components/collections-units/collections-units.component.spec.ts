import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsUnitsComponent } from './collections-units.component';

describe('CollectionsUnitsComponent', () => {
  let component: CollectionsUnitsComponent;
  let fixture: ComponentFixture<CollectionsUnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionsUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
