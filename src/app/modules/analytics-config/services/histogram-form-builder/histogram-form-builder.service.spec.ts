import { HistogramFormBuilderService } from './histogram-form-builder.service';
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MetricCollectFormBuilderService } from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { BucketsIntervalFormBuilderService } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { of } from 'rxjs';

describe('HistogramFormBuilderService', () => {
  let spectator: SpectatorService<HistogramFormBuilderService>;

  const createService = createServiceFactory({
    service: HistogramFormBuilderService,
    providers: [
      BucketsIntervalFormBuilderService,
      MetricCollectFormBuilderService,
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
