import { SearchGlobalFormBuilderService } from './search-global-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
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
