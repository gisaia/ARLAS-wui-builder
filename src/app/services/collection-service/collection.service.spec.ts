import { CollectionService } from './collection.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';

describe('CollectionService', () => {
  let spectator: SpectatorService<CollectionService>;
  const createService = createServiceFactory({
    service: CollectionService,
    mocks: [
      ArlasCollaborativesearchService,
      DefaultValuesService,
      TranslateService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
