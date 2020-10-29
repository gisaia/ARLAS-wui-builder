import { MapImportService } from './map-import.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MapLayerFormBuilderService } from '../map-layer-form-builder/map-layer-form-builder.service';
import { MapVisualisationFormBuilderService } from '../map-visualisation-form-builder/map-visualisation-form-builder.service';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';

describe('MapImportService', () => {
  let spectator: SpectatorService<MapImportService>;

  const createService = createServiceFactory({
    service: MapImportService,
    providers: [
      mockProvider(MapLayerFormBuilderService),
      mockProvider(MapVisualisationFormBuilderService),
      mockProvider(MapGlobalFormBuilderService),
      mockProvider(MainFormService),
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
