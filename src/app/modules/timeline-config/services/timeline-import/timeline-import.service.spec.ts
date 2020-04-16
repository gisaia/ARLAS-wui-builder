import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { TimelineImportService } from './timeline-import.service';

describe('TimelineImportService', () => {
  let spectator: SpectatorService<TimelineImportService>;

  const createService = createServiceFactory({
    service: TimelineImportService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
