import { CollectionService } from './collection.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('CollectionService', () => {
  let spectator: SpectatorService<CollectionService>;
  const createService = createServiceFactory({
    service: CollectionService,
    mocks: [
      ArlasCollaborativesearchService,
      DefaultValuesService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
