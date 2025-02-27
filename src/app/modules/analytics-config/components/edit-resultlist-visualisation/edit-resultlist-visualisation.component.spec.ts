import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResultlistVisualisationComponent } from './edit-resultlist-visualisation.component';

describe('EditResultlistVisualisationComponent', () => {
  let component: EditResultlistVisualisationComponent;
  let fixture: ComponentFixture<EditResultlistVisualisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditResultlistVisualisationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditResultlistVisualisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
