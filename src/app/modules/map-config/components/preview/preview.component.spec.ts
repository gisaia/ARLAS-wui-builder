import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewComponent } from './preview.component';
import { MapglComponent, MapglModule } from 'arlas-web-components';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { CustomTranslateLoader } from 'arlas-wui-toolkit/shared.module';
import { MockComponent } from 'ng-mocks';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { mockProvider } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PreviewComponent,
        MockComponent(MapglComponent)
      ],
      providers: [
        mockProvider(HttpClient),
        mockProvider(TranslateLoader),
        mockProvider(TranslateService),
        mockProvider(ArlasCollaborativesearchService),
        mockProvider(ArlasConfigurationUpdaterService),
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA, useValue: {
            mapglContributor: null,
            mapComponentConfig: {
              input: {}
            }
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
