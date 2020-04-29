import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { MapInitService } from './map-init.service';

describe('MapInitService', () => {
  let spectator: SpectatorService<MapInitService>;

  const createService = createServiceFactory({
    service: MapInitService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
