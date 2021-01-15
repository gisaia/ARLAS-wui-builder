import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { MapBasemapFormBuilderService } from './map-basemap-form-builder.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('MapBasemapFormBuilderService', () => {
  let spectator: SpectatorService<MapBasemapFormBuilderService>;

  const createService = createServiceFactory({
    service: MapBasemapFormBuilderService,
    providers: [
      mockProvider(DefaultValuesService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
