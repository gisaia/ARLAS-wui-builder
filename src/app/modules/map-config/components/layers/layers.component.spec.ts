import { FormArray } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasColorService, MapglLayerIconModule, MapglLegendModule } from 'arlas-web-components';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasConfigurationUpdaterService,
  ArlasStartupService, CONFIG_UPDATER
} from 'arlas-wui-toolkit';
import { LayersComponent } from './layers.component';
import { ArlasColorService } from 'arlas-web-components';

describe('LayersComponent', () => {
  let spectator: Spectator<LayersComponent>;
  const createComponent = createComponentFactory({
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorService),
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
