import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MapInitService } from './map-init.service';
import { CollectionService } from '@services/collection-service/collection.service';

describe('MapInitService', () => {
  let spectator: SpectatorService<MapInitService>;

  const createService = createServiceFactory({
    service: MapInitService,
    providers: [
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
