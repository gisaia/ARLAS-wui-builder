import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { EditHistogramLabelComponent } from './edit-histogram-label.component';

describe('EditHistogramLabelComponent', () => {
  let component: EditHistogramLabelComponent;
  let fixture: ComponentFixture<EditHistogramLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditHistogramLabelComponent ],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateNoOpLoader
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
