import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService, ArlasStartupService } from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';
import { ResultListImportService } from './result-list-import.service';

describe('ResultListImportService', () => {
  let spectator: SpectatorService<ResultListImportService>;

  const createService = createServiceFactory({
    service: ResultListImportService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
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
