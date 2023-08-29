import { PowerbarFormBuilderService } from './powerbar-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorService } from 'arlas-web-components';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

describe('PowerbarFormBuilderService', () => {
  let spectator: SpectatorService<PowerbarFormBuilderService>;

  const createService = createServiceFactory({
    service: PowerbarFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService)
    ]
  });

  beforeEach(() => {
    spectator = createService({});
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
