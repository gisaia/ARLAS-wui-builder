import { DonutFormBuilderService } from './donut-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';

describe('DonutFormBuilderService', () => {
  let spectator: SpectatorService<DonutFormBuilderService>;

  const createService = createServiceFactory({
    service: DonutFormBuilderService,
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
