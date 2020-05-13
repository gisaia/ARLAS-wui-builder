import { MetricFormBuilderService } from './metric-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';

describe('MetricFormBuilderService', () => {
  let spectator: SpectatorService<MetricFormBuilderService>;

  const createService = createServiceFactory({
    service: MetricFormBuilderService,
    providers: [
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createService({});
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});

