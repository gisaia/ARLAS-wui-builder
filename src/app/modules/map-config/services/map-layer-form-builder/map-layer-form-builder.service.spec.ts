import { MapLayerFormBuilderService } from './map-layer-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorService } from 'arlas-web-components';

describe('MapLayerFormBuilderService', () => {
  let spectator: SpectatorService<MapLayerFormBuilderService>;

  const createService = createServiceFactory({
    service: MapLayerFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
