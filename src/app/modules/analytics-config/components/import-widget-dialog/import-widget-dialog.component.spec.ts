import { HttpClient } from '@angular/common/http';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasConfigurationDescriptor, ArlasStartupService,
  AuthentificationService, getOptionsFactory, GET_OPTIONS, PersistenceService
} from 'arlas-wui-toolkit';
import { ImportWidgetDialogComponent } from './import-widget-dialog.component';

describe('ImportLayerDialogComponent', () => {

  let spectator: Spectator<ImportWidgetDialogComponent>;
  const createComponent = createComponentFactory({
    component: ImportWidgetDialogComponent,
    declarations: [

    ],
    providers: [
      mockProvider(MainFormService),
      mockProvider(ArlasConfigService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(StartupService),
      mockProvider(ArlasStartupService),
      mockProvider(AuthentificationService),
      mockProvider(ArlasConfigurationDescriptor),
      mockProvider(PersistenceService),
      mockProvider(HttpClient),
      {
        provide: GET_OPTIONS,
        useFactory: getOptionsFactory,
        deps: [AuthentificationService]
      }
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
