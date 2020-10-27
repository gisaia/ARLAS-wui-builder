import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewComponent } from './preview.component';
import { MapglComponent, MapglModule } from 'arlas-web-components';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { ArlasCollaborativesearchService, ArlasStartupService } from 'arlas-wui-toolkit';
import { mockProvider } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';
import { CollectionService } from '@services/collection-service/collection.service';

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
        mockProvider(ArlasStartupService),
        mockProvider(CollectionService),
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
