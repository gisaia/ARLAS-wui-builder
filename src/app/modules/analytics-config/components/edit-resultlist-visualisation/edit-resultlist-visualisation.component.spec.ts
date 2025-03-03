import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResultlistVisualisationComponent } from './edit-resultlist-visualisation.component';
import { mockProvider } from '@ngneat/spectator';
import {
  ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';

describe('EditResultlistVisualisationComponent', () => {
  let component: EditResultlistVisualisationComponent;
  let fixture: ComponentFixture<EditResultlistVisualisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditResultlistVisualisationComponent],
      providers: [
        mockProvider(ResultlistFormBuilderService)
      ]
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
