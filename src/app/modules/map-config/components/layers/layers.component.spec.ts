import { LayersComponent } from './layers.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray } from '@angular/forms';
import { MapglLegendModule, MapglLayerIconModule } from 'arlas-web-components';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';
import {
  ArlasCollaborativesearchService, ArlasStartupService,
  ArlasConfigService, CONFIG_UPDATER
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

describe('LayersComponent', () => {
  let spectator: Spectator<LayersComponent>;
  const createComponent = createComponentFactory({
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasConfigurationUpdaterService),
      mockProvider(CollectionService),
      { provide: CONFIG_UPDATER, useValue: {} },
      mockProvider(MainFormService, {
        mapConfig: {
          getLayersFa: () => new FormArray([]),
          getVisualisationsFa: () => new FormArray([])
        }
      })
    ],
    imports: [
      MapglLayerIconModule, MapglLegendModule
    ],
    component: LayersComponent,
  });

  beforeEach(() => spectator = createComponent());

  it('should be loaded successfully', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a table', () => {
    expect(spectator.queryAll('table')).toBeDefined();
  });
});
