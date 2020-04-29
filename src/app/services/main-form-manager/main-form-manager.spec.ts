import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { GET_OPTIONS } from '@services/persistence/persistence.service';
import { ArlasCollaborativesearchService, ArlasStartupService } from 'arlas-wui-toolkit';
import { MainFormManagerService } from './main-form-manager.service';

describe('MainFormManagerService', () => {
  let spectator: SpectatorService<MainFormManagerService>;
  const createService = createServiceFactory({
    service: MainFormManagerService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      {provide: GET_OPTIONS, useValue: {}}
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
