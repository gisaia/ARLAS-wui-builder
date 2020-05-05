import { MapGlobalFormBuilderService } from './map-global-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MapGlobalFormBuilderService', () => {
  let spectator: SpectatorService<MapGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: MapGlobalFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
