import { TestBed } from '@angular/core/testing';
import { MetricsTableFormBuilderService } from './metrics-table-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';

describe('MetricsTableFormBuilderService', () => {
  let spectator: SpectatorService<MetricsTableFormBuilderService>;

  const createService = createServiceFactory({
    service: MetricsTableFormBuilderService,
    providers: [
      mockProvider(CollectionService,{
        getCollections: () => [],
        getCollectionFields: () => of([])
      }),
    ]
  });

  beforeEach(() => {
    spectator = createService({});
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});


