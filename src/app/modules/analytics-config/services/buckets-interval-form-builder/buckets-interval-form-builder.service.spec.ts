import { BucketsIntervalFormBuilderService } from './buckets-interval-form-builder.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

describe('BucketsIntervalFormBuilderService', () => {
  let spectator: SpectatorService<BucketsIntervalFormBuilderService>;

  const createService = createServiceFactory({
    service: BucketsIntervalFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
