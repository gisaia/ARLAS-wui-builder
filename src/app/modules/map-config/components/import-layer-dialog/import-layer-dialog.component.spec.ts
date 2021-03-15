import { HttpClient } from '@angular/common/http';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import { LayerIdToName } from 'arlas-web-components';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { getOptionsFactory } from 'arlas-wui-toolkit/app.module';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { GET_OPTIONS, PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { MockPipe } from 'ng-mocks';
import { ImportLayerDialogComponent } from './import-layer-dialog.component';

describe('ImportLayerDialogComponent', () => {

  let spectator: Spectator<ImportLayerDialogComponent>;
  const createComponent = createComponentFactory({
    component: ImportLayerDialogComponent,
    declarations: [

      MockPipe(LayerIdToName)
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
    ],
    entryComponents: [
      ImportLayerDialogComponent
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
