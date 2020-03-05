import { WalkthroughService } from './walkthrough.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('WalkthroughService', () => {
  let spectator: SpectatorService<WalkthroughService>;
  const createService = createServiceFactory({
    service: WalkthroughService
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});

