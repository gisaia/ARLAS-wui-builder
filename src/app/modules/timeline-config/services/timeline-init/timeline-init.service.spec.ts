import { TimelineInitService } from './timeline-init.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { TimelineGlobalFormBuilderService } from '../timeline-global-form-builder/timeline-global-form-builder.service';

describe('TimelineInitService', () => {
  let spectator: SpectatorService<TimelineInitService>;

  const createService = createServiceFactory({
    service: TimelineInitService,
    providers: [
      mockProvider(TimelineGlobalFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
