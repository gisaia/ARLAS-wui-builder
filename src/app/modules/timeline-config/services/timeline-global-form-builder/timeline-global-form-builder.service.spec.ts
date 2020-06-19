import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { TimelineGlobalFormBuilderService } from './timeline-global-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';

describe('TimelineGlobalFormBuilderService', () => {
  let spectator: SpectatorService<TimelineGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: TimelineGlobalFormBuilderService,
    providers: [
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
