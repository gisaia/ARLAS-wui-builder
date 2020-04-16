import { TimelineInitService } from './timeline-init.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('TimelineInitService', () => {
  let spectator: SpectatorService<TimelineInitService>;

  const createService = createServiceFactory({
    service: TimelineInitService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
