import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewModalComponent } from './preview-modal.component';
import { MapglComponent, MapglModule } from 'arlas-web-components';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomTranslateLoader } from 'arlas-wui-toolkit/shared.module';
import { MockComponent } from 'ng-mocks';

describe('PreviewModalComponent', () => {
  let component: PreviewModalComponent;
  let fixture: ComponentFixture<PreviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PreviewModalComponent,
        MockComponent(MapglComponent)
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA, useValue: {
            mapglContributor: null,
            idField: 'id',
            initZoom: 14,
            initCenter: [0, 0],
            layers: [],
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
