import { ResultlistFormBuilderService } from './resultlist-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { ArlasColorService } from 'arlas-web-components';

describe('ResultlistFormBuilderService', () => {
  let spectator: SpectatorService<ResultlistFormBuilderService>;

  const createService = createServiceFactory({
    service: ResultlistFormBuilderService,
    providers: [
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      }),
      mockProvider(CollectionService),
      mockProvider(ArlasColorService),
    ]
  });

  beforeEach(() => {
    spectator = createService({});
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
