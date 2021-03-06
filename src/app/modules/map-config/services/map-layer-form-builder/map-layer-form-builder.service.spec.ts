import { MapLayerFormBuilderService } from './map-layer-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

describe('MapLayerFormBuilderService', () => {
  let spectator: SpectatorService<MapLayerFormBuilderService>;

  const createService = createServiceFactory({
    service: MapLayerFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorGeneratorLoader),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
