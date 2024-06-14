import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHistogramLabelComponent } from './edit-histogram-label.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('EditHistogramLabelComponent', () => {
  let component: EditHistogramLabelComponent;
  let fixture: ComponentFixture<EditHistogramLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditHistogramLabelComponent ],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateFakeLoader
        }
      })]
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
