import { MetricCollectFormBuilderService } from './metric-collect-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';

describe('MetricFormBuilderService', () => {
  let spectator: SpectatorService<MetricCollectFormBuilderService>;

  const createService = createServiceFactory({
    service: MetricCollectFormBuilderService,
    providers: [
      mockProvider(CollectionService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
