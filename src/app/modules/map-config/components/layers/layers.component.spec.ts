import { FormArray } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasColorService } from 'arlas-web-components';
import { LegendComponent, LayerIconComponent } from 'arlas-map';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasConfigurationUpdaterService,
  ArlasStartupService, CONFIG_UPDATER
} from 'arlas-wui-toolkit';
import { LayersComponent } from './layers.component';

describe('LayersComponent', () => {
  let spectator: Spectator<LayersComponent>;
  const createComponent = createComponentFactory({
    declarations: [
      LegendComponent, LayerIconComponent
    ],
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
