import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHistogramLabelComponent } from './edit-histogram-label.component';

describe('EditHistogramLabelComponent', () => {
  let component: EditHistogramLabelComponent;
  let fixture: ComponentFixture<EditHistogramLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditHistogramLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditHistogramLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
