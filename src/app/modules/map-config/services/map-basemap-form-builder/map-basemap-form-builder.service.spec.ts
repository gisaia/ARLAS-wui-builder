import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { MapBasemapFormBuilderService } from './map-basemap-form-builder.service';

describe('MapBasemapFormBuilderService', () => {
  let spectator: SpectatorService<MapBasemapFormBuilderService>;

  const createService = createServiceFactory({
    service: MapBasemapFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
