import { MapImportService } from './map-import.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MapLayerFormBuilderService } from '../map-layer-form-builder/map-layer-form-builder.service';

describe('MapImportService', () => {
  let spectator: SpectatorService<MapImportService>;

  const createService = createServiceFactory({
    service: MapImportService,
    providers: [
      mockProvider(MapLayerFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
