import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { TimelineFormBuilderService } from './timeline-form-builder.service';

describe('TimelineFormBuilderService', () => {
  let spectator: SpectatorService<TimelineFormBuilderService>;

  const createService = createServiceFactory({
    service: TimelineFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
