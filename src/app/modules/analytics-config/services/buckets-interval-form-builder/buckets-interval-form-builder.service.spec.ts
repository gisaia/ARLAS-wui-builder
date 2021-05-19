import { BucketsIntervalFormBuilderService } from './buckets-interval-form-builder.service';
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';

describe('BucketsIntervalFormBuilderService', () => {
  let spectator: SpectatorService<BucketsIntervalFormBuilderService>;

  const createService = createServiceFactory({
    service: BucketsIntervalFormBuilderService,
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
