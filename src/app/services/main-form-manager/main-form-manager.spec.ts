import { MainFormManagerService } from './main-form-manager.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasStartupService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('MainFormManagerService', () => {
  let spectator: SpectatorService<MainFormManagerService>;
  const createService = createServiceFactory({
    service: MainFormManagerService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
