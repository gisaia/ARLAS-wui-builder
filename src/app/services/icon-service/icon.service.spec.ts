import { IconService } from './icon.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('IconService', () => {
  let spectator: SpectatorService<IconService>;
  const createService = createServiceFactory({
    service: IconService
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
