import { SearchGlobalFormBuilderService } from './search-global-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';

describe('SearchGlobalFormBuilderService', () => {
  let spectator: SpectatorService<SearchGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: SearchGlobalFormBuilderService,
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
