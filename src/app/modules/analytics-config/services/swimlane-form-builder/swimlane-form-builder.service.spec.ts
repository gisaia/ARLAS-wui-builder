import { SwimlaneFormBuilderService } from './swimlane-form-builder.service';
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { BucketsIntervalFormBuilderService } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';
import { of } from 'rxjs';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('SwimlaneFormBuilderService', () => {
  let spectator: SpectatorService<SwimlaneFormBuilderService>;

  const createService = createServiceFactory({
    service: SwimlaneFormBuilderService,
    providers: [
      BucketsIntervalFormBuilderService,
      MetricFormBuilderService,
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      }),
      mockProvider(DefaultValuesService, {
        getDefaultConfig: () => ({
          huePalettes: []
        })
      })
    ]
  });

  beforeEach(() => {
    spectator = createService({});
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
