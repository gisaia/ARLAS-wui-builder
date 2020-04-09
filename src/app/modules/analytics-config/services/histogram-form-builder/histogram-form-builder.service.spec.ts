import { HistogramFormBuilderService } from './histogram-form-builder.service';
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';
import { BucketsIntervalFormBuilderService } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { of } from 'rxjs';

describe('HistogramFormBuilderService', () => {
  let spectator: SpectatorService<HistogramFormBuilderService>;

  const createService = createServiceFactory({
    service: HistogramFormBuilderService,
    providers: [
      BucketsIntervalFormBuilderService,
      MetricFormBuilderService,
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
