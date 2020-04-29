import { MapLayerFormBuilderService } from './map-layer-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MapLayerFormBuilderService', () => {
  let spectator: SpectatorService<MapLayerFormBuilderService>;

  const createService = createServiceFactory({
    service: MapLayerFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
