import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { TimelineGlobalFormBuilderService } from './timeline-global-form-builder.service';

describe('TimelineGlobalFormBuilderService', () => {
  let spectator: SpectatorService<TimelineGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: TimelineGlobalFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
