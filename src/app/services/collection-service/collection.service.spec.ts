import { CollectionService } from './collection.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('CollectionService', () => {
  let spectator: SpectatorService<CollectionService>;
  const createService = createServiceFactory({
    service: CollectionService,
    providers: [
      mockProvider(ArlasCollaborativesearchService)
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
