import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGroupEditionComponent } from './data-group-edition.component';

describe('DataGroupEditionComponent', () => {
  let component: DataGroupEditionComponent;
  let fixture: ComponentFixture<DataGroupEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGroupEditionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DataGroupEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
