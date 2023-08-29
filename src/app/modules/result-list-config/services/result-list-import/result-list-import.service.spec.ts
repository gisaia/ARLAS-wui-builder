import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasStartupService } from 'arlas-wui-toolkit';

import { ResultListImportService } from './result-list-import.service';
import { ArlasColorService } from 'arlas-web-components';

describe('ResultListImportService', () => {
  let spectator: SpectatorService<ResultListImportService>;

  const createService = createServiceFactory({
    service: ResultListImportService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
